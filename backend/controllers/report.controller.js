const { pool } = require('../config/db');


/* =========================
   ADMIN DASHBOARD SUMMARY
========================= */
const getDashboardSummary = async (req, res) => {

    try {

        const [[orders]] = await pool.query(
            "SELECT COUNT(*) as total_orders FROM orders"
        );

        const [[users]] = await pool.query(
            "SELECT COUNT(*) as total_users FROM users"
        );

        const [[products]] = await pool.query(
            "SELECT COUNT(*) as total_products FROM products"
        );

        const [[revenue]] = await pool.query(
            "SELECT SUM(total_amount) as total_revenue FROM orders WHERE status='completed'"
        );

        const [[commission]] = await pool.query(
            "SELECT SUM(platform_commission) as total_commission FROM order_items"
        );

        res.json({
            total_orders: orders.total_orders,
            total_users: users.total_users,
            total_products: products.total_products,
            total_revenue: revenue.total_revenue || 0,
            total_commission: commission.total_commission || 0
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });

    }

};


/* =========================
   TOP SELLERS REPORT
========================= */

const getTopSellers = async (req, res) => {

    try {

        const [sellers] = await pool.query(`
            SELECT 
                u.id,
                u.business_name,
                SUM(oi.seller_earnings) as total_earnings
            FROM order_items oi
            JOIN users u ON oi.seller_id = u.id
            GROUP BY oi.seller_id
            ORDER BY total_earnings DESC
            LIMIT 10
        `);

        res.json(sellers);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Failed to fetch top sellers" });

    }

};


/* =========================
   DAILY SALES REPORT
========================= */

const getDailySales = async (req, res) => {
    try {
        const [sales] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(id) as orders,
                CAST(SUM(total_amount) AS DECIMAL(10,2)) as revenue
            FROM orders
            WHERE payment_status = 'paid' OR status = 'paid'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        `);
        res.json(sales);
    } catch (error) {
        console.error("Sales Report Error:", error);
        res.status(500).json({ error: "Failed to fetch sales report" });
    }
};

/* =========================
   PRODUCT PERFORMANCE REPORT
========================= */

const getProductPerformance = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price_at_purchase) as revenue
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 20
        `);
        res.json(products);
    } catch (error) {
        console.error("Product Performance Error:", error);
        res.status(500).json({ error: "Failed to fetch product performance" });
    }
};

/* =========================
   SELLER PERFORMANCE REPORT
========================= */

const getSellerPerformance = async (req, res) => {
    try {
        // Use order_items instead of seller_earnings (matches your DB schema)
        const [sellers] = await pool.query(`
            SELECT 
                u.id as seller_id,
                u.name as seller_name,  -- Changed from business_name
                COUNT(DISTINCT oi.order_id) as orders,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase * 0.9), 0) as revenue
            FROM users u
            JOIN order_items oi ON u.id = oi.seller_id
            JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
            GROUP BY u.id, u.name
            ORDER BY revenue DESC
            LIMIT 10
        `);
        res.json(sellers);
    } catch (error) {
        console.error("Seller Performance Error:", error);
        res.status(500).json({ error: "Failed to fetch seller performance" });
    }
};

//
const getSalesReport = async (req, res) => {
    try {
        const [sales] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                COUNT(*) as orders,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM orders 
            WHERE payment_status = 'paid'
            GROUP BY DATE(created_at)
            ORDER BY date DESC 
            LIMIT 30
        `);
        res.json(sales);
    } catch (error) {
        console.error("Sales Report Error:", error);
        res.status(500).json({ error: "Failed to fetch sales report" });
    }
};

module.exports = {
    getDashboardSummary,
    getTopSellers,
    getDailySales,
    getProductPerformance,
    getSellerPerformance,
    getSalesReport 
};