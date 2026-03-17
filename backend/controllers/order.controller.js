const { pool } = require('../config/db');
const { initializePayment, verifyPayment } = require('../config/chapa');
const updateSellerBalance = require('../utils/updateSellerBalance');
const { createNotification } = require('./notification.controller');

// ================================
// SAFE JSON PARSER
// ================================
const safeJSON = (data) => {
    try {
        return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
        return null;
    }
};


// ================================
// 1. CREATE ORDER (Customer Side + Chapa Payment)
// ================================

const createOrder = async (req, res) => {
    // 1. Destructure using the names sent from React
    const { items, total_amount, shipping_address, phone_number, email } = req.body;
    const tx_ref = `tx-${Date.now()}`;
    const connection = await pool.getConnection();

    try {
        if (!items || items.length === 0)
            return res.status(400).json({ error: "Order must contain items" });

        await connection.beginTransaction();

        // ================================
        // 1. VALIDATE STOCK & PREPARE DATA
        // ================================
        for (const item of items) {
            const targetId = item.variant_id; // Frontend now sends variant_id correctly

            let [variantRows] = await connection.query(
                `SELECT pv.id as actual_variant_id, pv.stock_quantity, p.name, p.seller_id
                 FROM product_variants pv
                 JOIN products p ON pv.product_id = p.id
                 WHERE pv.id = ?`,
                [targetId]
            );

            if (variantRows.length === 0) {
                throw new Error(`Order failed: Item ID ${targetId} is not valid.`);
            }

            if (variantRows[0].stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for item: ${variantRows[0].name}`);
            }

            // Map correct IDs and price for the next steps
            item.actual_variant_id = variantRows[0].actual_variant_id;
            item.seller_id = variantRows[0].seller_id;
            item.product_name = variantRows[0].name;
            // Use price_at_purchase from body, or fallback to 0
            item.final_price = item.price_at_purchase || 0; 
        }

        // ================================
        // 2. INSERT INTO ORDERS (Matches your SQL columns exactly)
        // ================================
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
             (customer_id, total_amount, shipping_address, phone_number, email, chapa_tx_ref, status, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
            [
                req.user.id,
                total_amount, // Matched to React
                JSON.stringify(shipping_address), // shipping_address is now an object from React
                phone_number, // Matched to React
                email,
                tx_ref
            ]
        );

        const orderId = orderResult.insertId;

        // ================================
        // 3. INSERT ORDER ITEMS (Matches price_at_purchase column)
        // ================================
        const itemValues = items.map(item => [
            orderId,
            item.actual_variant_id,
            item.seller_id,
            item.quantity || 1,
            item.final_price // This maps to price_at_purchase
        ]);

        await connection.query(
            `INSERT INTO order_items 
             (order_id, variant_id, seller_id, quantity, price_at_purchase)
             VALUES ?`,
            [itemValues]
        );

        // ================================
        // 4. REDUCE STOCK & NOTIFY
        // ================================
        for (const item of items) {
            await connection.query(
                `UPDATE product_variants 
                 SET stock_quantity = stock_quantity - ?
                 WHERE id=? AND stock_quantity >= ?`,
                [item.quantity || 1, item.actual_variant_id, item.quantity || 1]
            );

            // Low stock check
            const [stockCheck] = await connection.query(
                `SELECT stock_quantity FROM product_variants WHERE id = ?`,
                [item.actual_variant_id]
            );

            const remainingStock = stockCheck[0].stock_quantity;
            if (remainingStock < 5) {
                await createNotification({
                    body: {
                        user_id: item.seller_id,
                        title: "Low Stock Alert",
                        message: `The product "${item.product_name}" is running low. Only ${remainingStock} left!`,
                        type: "low_stock"
                    }
                }, { json: () => { } });
            }
        }

        // ================================
        // 5. INITIALIZE CHAPA PAYMENT
        // ================================
        const chapaResponse = await initializePayment({
            amount: total_amount.toString(),
            currency: "ETB",
            email,
            first_name: req.user.name || "Customer",
            tx_ref,
           callback_url: `https://ecommerce-backend-t706.onrender.com/api/orders/verify-payment/${tx_ref}`,
           return_url: `https://ecommerce-frontend-6y9o.onrender.com/order-success?trx_ref=${tx_ref}`
        });

        await connection.commit();

        res.json({
            checkout_url: chapaResponse.data.data.checkout_url,
            orderId: orderId,
            tx_ref
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Order Creation Crash:', err.message);
        res.status(500).json({ error: err.message || 'Order creation failed' });
    } finally {
        if (connection) connection.release();
    }
};



// ================================
// 2. GET ORDER RECEIPT BY tx_ref
// ================================
const getOrderReceipt = async (req, res) => {

    try {

        const tx_ref = req.params.tx_ref;


        // ================================
        // VERIFY PAYMENT WITH CHAPA
        // ================================
        const paymentResponse = await verifyPayment(tx_ref);

if (
    paymentResponse.data.status === "success" ||
    paymentResponse.data.data?.status === "success"
) {

    // Check current order status first
    const [orderStatus] = await pool.query(
        `SELECT status FROM orders WHERE chapa_tx_ref=?`,
        [tx_ref]
    );

    // Only update if not already paid
    if (orderStatus.length && orderStatus[0].status !== "paid") {

        await pool.query(
            `UPDATE orders SET status='paid', payment_status='paid' WHERE chapa_tx_ref=?`,
            [tx_ref]
        );

        await updateSellerBalance(tx_ref);

    }

}


const [order] = await pool.query(
    `SELECT * FROM orders WHERE chapa_tx_ref=?`,
    [tx_ref]
);

if (!order.length)
    return res.status(404).json({ error: 'Order not found' });


const [items] = await pool.query(
    `SELECT oi.*, p.name as product_name, pv.sku, pv.size, pv.color 
     FROM order_items oi
     JOIN product_variants pv ON oi.variant_id = pv.id
     JOIN products p ON pv.product_id = p.id
     WHERE oi.order_id=?`,
    [order[0].id]
);


const formattedOrder = {
    ...order[0],
    shipping_address: safeJSON(order[0].shipping_address)
};


res.json({
    order: formattedOrder,
    items
});

} catch (err) {

    console.error('Get order receipt error:', err);

    res.status(500).json({ error: 'Failed to fetch order receipt' });

}

};


// ================================
// 3. VERIFY PAYMENT CALLBACK
// ================================
const verifyPaymentCallback = async (req, res) => {
    const { tx_ref } = req.params;
    const connection = await pool.getConnection();

    try {
        const response = await verifyPayment(tx_ref);
        const paymentSuccess = response?.data?.status === "success" || response?.data?.data?.status === "success";

        if (!paymentSuccess) return res.status(400).send("Payment verification failed");

        await connection.beginTransaction();

        const [orderRows] = await connection.query(
            `SELECT id, payment_status FROM orders WHERE chapa_tx_ref=?`, [tx_ref]
        );

        if (!orderRows.length) {
            await connection.rollback();
            return res.status(404).send("Order not found");
        }

        const order = orderRows[0];

        if (order.payment_status !== "paid") {
            // 1. Mark Order as Paid
            await connection.query(
                `UPDATE orders SET status='paid', payment_status='paid' WHERE chapa_tx_ref=?`, [tx_ref]
            );

            // 2. INCREMENT TOTAL SOLD (The "Real-World" Part)
            // We find the parent product_id for each variant in the order and increment total_sold
            await connection.query(`
                UPDATE products p
                JOIN product_variants pv ON p.id = pv.product_id
                JOIN order_items oi ON pv.id = oi.variant_id
                SET p.total_sold = p.total_sold + oi.quantity
                WHERE oi.order_id = ?
            `, [order.id]);

            // 3. Update seller balances (Your existing utility)
            await updateSellerBalance(tx_ref);
        }

        await connection.commit();
       return res.redirect(`https://ecommerce-frontend-6y9o.onrender.com/order-success?trx_ref=${tx_ref}`);

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Payment callback error:", err);
        res.status(500).send("Error verifying payment");
    } finally {
        if (connection) connection.release();
    }
};



// ================================
// 4. GET CUSTOMER ORDERS
// ================================
const getCustomerOrders = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 10;

        const offset = (page - 1) * limit;


        const [orders] = await pool.query(

            `SELECT o.*, COUNT(oi.id) as total_items 
             FROM orders o 
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.customer_id=?
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,

            [req.user.id, limit, offset]

        );


        const [total] = await pool.query(
            `SELECT COUNT(*) as count FROM orders WHERE customer_id=?`,
            [req.user.id]
        );


        res.json({

            orders,

            pagination: {
                page,
                limit,
                total: total[0].count,
                totalPages: Math.ceil(total[0].count / limit)
            }

        });

    } catch (err) {

        console.error('Get customer orders error:', err);

        res.status(500).json({ error: 'Failed to fetch orders' });

    }

};



// ================================
// 5. GET ORDER DETAILS
// ================================
const getOrderDetails = async (req, res) => {

    try {

        const orderId = req.params.id;

        const [order] = await pool.query(
            `SELECT * FROM orders WHERE id=? AND customer_id=?`,
            [orderId, req.user.id]
        );

        if (!order.length)
            return res.status(404).json({ error: 'Order not found' });


        const [items] = await pool.query(

            `SELECT oi.*, p.name as product_name, pv.sku, pv.size, pv.color
             FROM order_items oi
             JOIN product_variants pv ON oi.variant_id=pv.id
             JOIN products p ON pv.product_id=p.id
             WHERE oi.order_id=?`,

            [orderId]

        );


        res.json({

            order: {
                ...order[0],
                shipping_address: safeJSON(order[0].shipping_address)
            },

            items: items.map(i => ({
    variant_id: i.variant_id,
    quantity: i.quantity,
    price: i.price_at_purchase
}))

        });

    } catch (err) {

        console.error('Get order details error:', err);

        res.status(500).json({ error: 'Failed to fetch order details' });

    }

};



// ================================
// 6. REQUEST RETURN
// ================================
const requestReturn = async (req, res) => {

    try {

        const orderId = req.params.id;

        const { reason } = req.body;


        const [order] = await pool.query(

            `SELECT * FROM orders 
             WHERE id=? AND customer_id=? AND status='delivered'`,

            [orderId, req.user.id]

        );

        if (!order.length)
            return res.status(400).json({ error: 'Return not allowed' });


        await pool.query(

            `INSERT INTO returns 
             (order_id, order_item_id, customer_id, reason, status, refund_amount) 
             SELECT o.id, oi.id, ?, ?, 'pending', oi.price_at_purchase 
             FROM orders o 
             JOIN order_items oi ON o.id=oi.order_id 
             WHERE o.id=?`,

            [req.user.id, reason, orderId]

        );


        await pool.query(
            `UPDATE orders SET status='returned' WHERE id=?`,
            [orderId]
        );


        res.json({
            message: 'Return request submitted successfully'
        });

    } catch (err) {

        console.error('Request return error:', err);

        res.status(500).json({ error: 'Failed to request return' });

    }

};



// ================================
// 7. REORDER
// ================================
const reorder = async (req, res) => {

    try {

        const orderId = req.params.id;

        const [order] = await pool.query(

            `SELECT * FROM orders WHERE id=? AND customer_id=?`,

            [orderId, req.user.id]

        );

        if (!order.length)
            return res.status(404).json({ error: 'Order not found' });


        const [items] = await pool.query(

            `SELECT * FROM order_items WHERE order_id=?`,

            [orderId]

        );


        res.json({

            message: 'Reorder initiated',

            items,

            totalAmount: order[0].total_amount

        });

    } catch (err) {

        console.error('Reorder error:', err);

        res.status(500).json({ error: 'Failed to reorder' });

    }

};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Update the order
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    // 2. Fetch customer details for the notification
    const [orderRows] = await pool.query(
      "SELECT customer_id, id FROM orders WHERE id = ?", 
      [id]
    );

    if (orderRows.length > 0) {
      const order = orderRows[0];
      
      // 3. Trigger In-App Notification (Wrapped to prevent 500 crashes)
      try {
        await createNotification({
          body: {
            user_id: order.customer_id,
            title: "Order Update",
            message: `Your order #${order.id} is now ${status.toUpperCase()}.`,
            type: "order" // Must match your SQL ENUM: 'order','payment','approval','low_stock'
          }
        }, { 
          // Robust mock for res
          status: function() { return this; }, 
          json: function() { return this; } 
        }); 
      } catch (notifErr) {
        console.error("Notification failed, but order was updated:", notifErr.message);
      }
    }

    res.json({ message: "Order status updated and customer notified" });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
//

const getAllOrders = async (req, res) => {
    try {
        // We JOIN with users to get the name and email
        const [orders] = await pool.query(`
            SELECT 
                o.*, 
                u.name as user_name, 
                u.email as user_email
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (err) {
        console.error("Fetch Orders Error:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};


// ================================
// EXPORT
// ================================
module.exports = {
    createOrder,
    getOrderReceipt,
    verifyPaymentCallback,
    getCustomerOrders,
    getOrderDetails,
    requestReturn,
    reorder,
     updateOrderStatus,
     getAllOrders
};