const { pool } = require('../config/db');

const safeJSON = (data) => {
    try {
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const getPendingSellers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, business_name, business_license, created_at FROM users WHERE role = 'seller' AND is_approved = 0"
        );

        res.json(rows);
    } catch (error) {
        console.error("Pending sellers error:", error);
        res.status(500).json({ error: "Failed to fetch pending sellers" });
    }
};

const approveSeller = async (req, res) => {
    try {

        const { id } = req.params;

        const [seller] = await pool.query(
            "SELECT id FROM users WHERE id=? AND role='seller'",
            [id]
        );

        if (!seller.length) {
            return res.status(404).json({ error: "Seller not found" });
        }

        await pool.query(
            "UPDATE users SET is_approved=1,status='active' WHERE id=?",
            [id]
        );

        res.json({
            success: true,
            message: "Seller approved successfully"
        });

    } catch (error) {
        res.status(500).json({ error: "Seller approval failed" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, role, status, phone, created_at FROM users"
        );

        res.json(rows);
    } catch (error) {
        console.error("Users fetch error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};


const getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [users] = await pool.query(
            "SELECT COUNT(*) as total FROM users"
        );

        // Approved sellers
        const [sellers] = await pool.query(
            "SELECT COUNT(*) as total FROM users WHERE role = 'seller' AND is_approved = 1"
        );

        // Total products
        const [products] = await pool.query(
            "SELECT COUNT(*) as total FROM products"
        );

        // Orders + revenue
        const [orders] = await pool.query(
            "SELECT COUNT(*) as total, COALESCE(SUM(total_amount),0) as revenue FROM orders"
        );

        // Pending sellers
        const [pendingSellers] = await pool.query(
            "SELECT COUNT(*) as total FROM users WHERE role = 'seller' AND is_approved = 0"
        );

        // 🔥 NEW: Pending orders
        const [pendingOrders] = await pool.query(
            "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'"
        );

        // 🔥 NEW: Low stock products
        const [lowStock] = await pool.query(`
SELECT COUNT(*) as total
FROM product_variants
WHERE stock_quantity <= 5
`);

        res.json({
            totalUsers: users[0].total,
            totalSellers: sellers[0].total,
            totalProducts: products[0].total,
            totalOrders: orders[0].total,
            totalRevenue: parseFloat(orders[0].revenue),

            pendingSellers: pendingSellers[0].total,
            pendingOrders: pendingOrders[0].total,
            lowStock: lowStock[0].total
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Stats failed" });
    }
};
//
// ================================
// SALES ANALYTICS
// ================================

// Revenue by day
const getRevenueAnalytics = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as revenue
            FROM orders
            WHERE payment_status='paid'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Revenue analytics failed" });

    }
};

// NEW: Fetch all products waiting for approval
const getPendingProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.name, p.base_price, p.status, p.images, p.created_at,
                u.business_name, c.name as category_name 
            FROM products p
            JOIN users u ON p.seller_id = u.id
            JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'pending'
            ORDER BY p.created_at DESC
        `);

        // FIX: Just parse the JSON and return the array of filenames
        rows.forEach(p => {
            p.images = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
            if (!Array.isArray(p.images)) p.images = [];
        });

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending products" });
    }
};

// NEW: Approve a specific product
const approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE products SET status = 'approved' WHERE id = ?", [id]);
        res.json({ success: true, message: "Product approved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Product approval failed" });
    }
};

// NEW: Reject/Delete a specific product
const rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE products SET status = 'rejected' WHERE id = ?", [id]);
        res.json({ success: true, message: "Product rejected" });
    } catch (error) {
        res.status(500).json({ error: "Product rejection failed" });
    }
};




// Orders analytics
const getOrderAnalytics = async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders
            FROM orders
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Orders analytics failed" });

    }
};
 
// ================================
// GET ALL ORDERS (ADMIN)
// ================================
const getAllOrders = async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.payment_status,
                o.created_at,
                u.name AS customer_name,
                u.email
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders" });

    }
};



// ================================
// UPDATE ORDER STATUS
// ================================
const updateOrderStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatus = [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid order status" });
        }

        const [result] = await pool.query(
"UPDATE orders SET status=? WHERE id=?",
[status, req.params.id]
);

if(result.affectedRows === 0){
   return res.status(404).json({error:"Order not found"});
}

        res.json({
            success: true,
            message: `Order status updated to ${status}`
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Order update failed" });

    }
};

// Top selling products
const getTopProducts = async (req, res) => {

    try {

       const [rows] = await pool.query(`
         SELECT 
         p.id,
         p.name,
         SUM(oi.quantity) AS total_sold
         FROM order_items oi
         JOIN product_variants pv ON oi.variant_id = pv.id
         JOIN products p ON pv.product_id = p.id
         GROUP BY p.id
         ORDER BY total_sold DESC
         LIMIT 10
`);

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Top products analytics failed" });

    }
};
// ================================
// GET APPROVED SELLERS
// ================================
const getAllSellers = async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT 
                id,
                name,
                email,
                business_name,
                phone,
                created_at
            FROM users
            WHERE role='seller'
            AND is_approved=1
            ORDER BY created_at DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Failed to fetch sellers" });

    }
};

const updateUserStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const allowedStatus = ['active','suspended','pending'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        await pool.query(
            "UPDATE users SET status=? WHERE id=?",
            [status, req.params.id]
        );

        res.json({
            success: true,
            message: `User status updated to ${status}`
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "User update failed" });

    }
};

const rejectSeller = async (req, res) => {

    try {

        await pool.query(
            "UPDATE users SET status='rejected' WHERE id=?",
            [req.params.id]
        );

        res.json({
            success:true,
            message:"Seller rejected"
        });

    } catch (error) {

        res.status(500).json({error:"Seller rejection failed"});

    }
};
// Add this to admin.controller.js
const getAllTransactions = async (req, res) => {
    try {
       
        const [rows] = await pool.query(`
            SELECT 
                o.chapa_tx_ref AS id, 
                o.id AS order_id, 
                u.name AS user_name, 
                o.total_amount AS amount, 
                'Chapa' AS method, 
                o.payment_status AS status, 
                o.created_at 
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.payment_status != 'pending'
            ORDER BY o.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("Transaction fetch error:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
};

//
module.exports = {
    getPendingSellers,
    approveSeller,
    getAllUsers,
    updateUserStatus,
    getDashboardStats,
    getRevenueAnalytics,
    getOrderAnalytics,
    getTopProducts,
    getAllOrders,
    updateOrderStatus,
    getAllSellers,
    rejectProduct,
    approveProduct,
    getPendingProducts,
    rejectSeller,
    getAllTransactions
};