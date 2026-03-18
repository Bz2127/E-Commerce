const pool = require("../config/db");
const axios = require("axios");
const updateSellerBalance = require('../utils/updateSellerBalance');

/* =================================
   INITIALIZE PAYMENT
================================= */

const initializePayment = async (req, res) => {

  try {

    const { order_id, email, first_name, last_name, amount } = req.body;

    const tx_ref = "TX-" + Date.now();

    const chapa = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name,
        last_name,
        tx_ref,
       callback_url: `https://your-backend.onrender.com/api/payment/verify/${tx_ref}`,
return_url: `https://ecommerce-frontend-6y9o.onrender.com/payment-success?trx_ref=${tx_ref}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    await pool.query(
      `UPDATE orders SET chapa_tx_ref=? WHERE id=?`,
      [tx_ref, order_id]
    );

    res.json(chapa.data);

  } catch (error) {

    console.error("Payment init error:", error.response?.data || error);

    res.status(500).json({
      error: "Failed to initialize payment"
    });

  }

};



/* =================================
   VERIFY PAYMENT
================================= */

const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET}` } }
    );

    const payment = response.data.data;

    if (payment.status === "success") {
      // THE FIX: updateSellerBalance ALREADY marks the order as 'paid' 
      // and updates the wallet in one safe transaction.
      const success = await updateSellerBalance(tx_ref);

      if (success) {
        // Optional: Log the success in payment_logs
        const [orders] = await pool.query(`SELECT id FROM orders WHERE chapa_tx_ref=?`, [tx_ref]);
        if (orders.length > 0) {
           await pool.query(
            `INSERT INTO payment_logs (order_id, tx_ref, payment_status, response_data)
             VALUES (?, ?, ?, ?)`,
            [orders[0].id, tx_ref, payment.status, JSON.stringify(payment)]
          );
        }

        return res.json({ message: "Payment verified and wallet updated!", payment });
      } else {
        return res.status(400).json({ error: "Balance update failed or already processed" });
      }

    } else {
      await pool.query(`UPDATE orders SET payment_status='failed' WHERE chapa_tx_ref=?`, [tx_ref]);
      res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    console.error("Verify error:", error.response?.data || error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};



/* =================================
   VIEW TRANSACTIONS (ADMIN)
================================= */

const getTransactions = async (req, res) => {

  try {

    const [transactions] = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total_amount,
        o.payment_status,
        o.created_at,
        u.name as customer
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(transactions);

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch transactions"
    });

  }

};



/* =================================
   PAYMENT LOGS
================================= */

const getPaymentLogs = async (req, res) => {

  try {

    const [logs] = await pool.query(`
      SELECT *
      FROM payment_logs
      ORDER BY created_at DESC
    `);

    res.json(logs);

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch payment logs"
    });

  }

};

const processMissedPayments = async (req, res) => {
  const { pool } = require("../config/db");  // ← FIX: Import pool here
  
  try {
    const [orders] = await pool.query(`
      SELECT chapa_tx_ref FROM orders 
      WHERE payment_status='paid' AND chapa_tx_ref IS NOT NULL
    `);
    
    let successCount = 0;
    for (const { chapa_tx_ref } of orders) {
      console.log(`Processing missed payment: ${chapa_tx_ref}`);
      const result = await updateSellerBalance(chapa_tx_ref);
      if (result) successCount++;
    }
    
    res.json({ 
      message: `Processed ${successCount}/${orders.length} missed payments`,
      processed: successCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { initializePayment, verifyPayment, getTransactions, getPaymentLogs, processMissedPayments };



module.exports = {
  initializePayment,
  verifyPayment,
  getTransactions,
  getPaymentLogs,
  processMissedPayments 
};