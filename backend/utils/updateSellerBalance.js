const { pool } = require('../config/db');
const calculateCommission = require('../utils/calculateCommission');

async function updateSellerBalance(tx_ref) {

const connection = await pool.getConnection();

try {

await connection.beginTransaction();

// =============================
// GET ORDER
// =============================
const [orders] = await connection.query(
`SELECT id, payment_status 
 FROM orders 
 WHERE chapa_tx_ref = ?`,
[tx_ref]
);

if (orders.length === 0) {
await connection.rollback();
return false;
}

const order = orders[0];

// Prevent double processing
if (order.payment_status === "paid") {
await connection.rollback();
return false;
}

// =============================
// GET ORDER ITEMS
// =============================
console.log(`Checking items for Order ID: ${order.id}`);

const [items] = await connection.query(
`SELECT seller_id, variant_id, quantity, price_at_purchase
 FROM order_items
 WHERE order_id = ?`,
[order.id]
);

// =============================
// PROCESS EACH ITEM
// =============================
for (const item of items) {

const itemTotal = item.price_at_purchase * item.quantity;

const { platformFee, sellerAmount } = calculateCommission(itemTotal);

// Update seller wallet
await connection.query(
`UPDATE users
 SET wallet_balance = wallet_balance + ?
 WHERE id = ?`,
[sellerAmount, item.seller_id]
);

// Record seller earnings
await connection.query(
`INSERT INTO seller_earnings
(seller_id, order_id, seller_amount, platform_fee)
VALUES (?, ?, ?, ?)`,
[item.seller_id, order.id, sellerAmount, platformFee]
);

// Record platform commission
await connection.query(
`INSERT INTO platform_commission
(order_id, amount)
VALUES (?, ?)`,
[order.id, platformFee]
);

}

// =============================
// MARK ORDER AS PAID
// =============================
await connection.query(
`UPDATE orders
 SET status='paid', payment_status='paid'
 WHERE id=?`,
[order.id]
);

await connection.commit();

return true;

} catch (err) {

await connection.rollback();
console.error("Transaction Completion Error:", err);
return false;

} finally {

connection.release();

}

}

module.exports = updateSellerBalance;