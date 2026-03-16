const { pool } = require('../config/db');
const path = require('path');
const fs = require('fs');

// ================================
// UTILITY: IMAGE URL FIXER
// ================================
const getImageUrl = (image_url) => {
    // Check if it's null, empty, or the literal string "undefined"
    if (!image_url || image_url === 'undefined' || image_url === 'null') return null;
    
    // If it's already a full URL, return it as is
    if (image_url.startsWith('http')) return image_url;

    // Clean the filename (extract only the name, e.g., 'image.jpg')
    const file = path.basename(image_url);
    
    // Construct the URL. Note: ensure we don't have double slashes
    const baseUrl = (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, "");
   return `${baseUrl}/uploads/products/${file}`;
};

// ================================
// 0️⃣ GET INVENTORY (LOW STOCK FIX)
// ================================
const getInventory = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const [products] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.base_price,
                p.discount_price,
                p.images, 
                p.stock_quantity,
                p.status,
                p.created_at,
                c.name AS category_name,
                COALESCE(SUM(pv.stock_quantity), p.stock_quantity) AS total_stock,
                CASE
                    WHEN COALESCE(SUM(pv.stock_quantity), p.stock_quantity) = 0 THEN 'Out of Stock'
                    WHEN COALESCE(SUM(pv.stock_quantity), p.stock_quantity) < 10 THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status,
                COUNT(pv.id) AS variant_count,
                COALESCE(MIN(pv.price), p.base_price) AS min_price,
                COALESCE(MAX(pv.price), p.base_price) AS max_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.seller_id = ?
            AND p.status IN ('approved','active','pending')
            GROUP BY p.id, c.name -- Simplified Group By (Standard for modern MySQL)
            ORDER BY p.created_at DESC
        `, [sellerId]);

        // Process images and formatting
       products.forEach(p => {
    try {
        let rawImages = [];
        if (p.images) {
            // Handle both stringified JSON and actual arrays
            rawImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        }

        // Map and FILTER: Remove any nulls or failed URLs
        p.images = Array.isArray(rawImages) 
            ? rawImages.map(img => getImageUrl(img)).filter(url => url !== null)
            : [];

        p.category = p.category_name || "Uncategorized";
        p.price = p.min_price || p.base_price || 0;
    } catch (err) {
        console.error("Error processing product images:", err);
        p.images = [];
    }
});
        res.json({
            inventory: products,
            lowStockCount: products.filter(p => p.stock_status === 'Low Stock').length,
            outOfStockCount: products.filter(p => p.stock_status === 'Out of Stock').length
        });

    } catch (err) {
        console.error("getInventory ERROR:", err);
        res.status(500).json({
            error: "Inventory fetch failed",
            details: err.message
        });
    }
};

// ================================
// 1️⃣ SELLER DASHBOARD STATS
// ================================

const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // 1. Wallet Balance
        const [user] = await pool.query(`SELECT wallet_balance FROM users WHERE id=?`, [sellerId]);
        const walletBalance = user[0]?.wallet_balance || 0;

        // 2. Withdrawal History
        const [history] = await pool.query(
            `SELECT amount, status, requested_at as date 
             FROM withdrawals WHERE seller_id=? ORDER BY requested_at DESC LIMIT 5`,
            [sellerId]
        );

        // 3. Total Revenue
        const [revenue] = await pool.query(
            `SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS totalRevenue
             FROM order_items oi JOIN orders o ON oi.order_id = o.id
             WHERE oi.seller_id = ? AND o.payment_status = 'paid'`, 
            [sellerId]
        );

        // 4. COUNTS - THESE WERE MISSING!
        const [productsCount] = await pool.query(`SELECT COUNT(*) AS total FROM products WHERE seller_id=?`, [sellerId]);
        const [ordersCount] = await pool.query(`SELECT COUNT(DISTINCT order_id) AS total FROM order_items WHERE seller_id=?`, [sellerId]);
        const [pendingCount] = await pool.query(
            `SELECT COUNT(DISTINCT oi.order_id) AS total 
             FROM order_items oi JOIN orders o ON oi.order_id = o.id 
             WHERE oi.seller_id=? AND o.status='pending'`, 
            [sellerId]
        );

        // 5. FIXED salesHistory (GROUP BY fix)
        const [salesHistory] = await pool.query(`
            SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                   COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
            FROM orders o JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.seller_id = ? AND o.payment_status = 'paid'
            GROUP BY DATE_FORMAT(o.created_at, '%Y-%m-%d')
            ORDER BY date DESC LIMIT 7
        `, [sellerId]);

        // 6. topProducts
        const [topProducts] = await pool.query(`
            SELECT p.name, COALESCE(SUM(oi.quantity), 0) as total_sold
            FROM products p 
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON oi.variant_id = pv.id
            JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
            WHERE p.seller_id = ?
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC LIMIT 5
        `, [sellerId]);

        res.json({
            totalProducts: productsCount[0].total || 0,
            totalOrders: ordersCount[0].total || 0,
            walletBalance: walletBalance,
            totalRevenue: revenue[0].totalRevenue || 0,
            pendingOrders: pendingCount[0].total || 0,
            withdrawHistory: history || [],
            topProducts,
            salesHistory
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: "Failed to load dashboard data" });
    }
};


// ================================
// 2️⃣ SELLER ORDERS
// ================================
const getSellerOrders = async (req, res) => {

    try {

        const sellerId = req.user.id;

        const [results] = await pool.query(`
            SELECT 
                oi.*,
                pv.sku,
                p.name AS product_name,
                o.status,
                u.name AS customer_name
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id=pv.id
            JOIN products p ON pv.product_id=p.id
            JOIN orders o ON oi.order_id=o.id
            JOIN users u ON o.customer_id=u.id
            WHERE oi.seller_id=?
            ORDER BY o.id DESC
        `, [sellerId]);

        res.json(results);

    } catch (err) {

        console.error("getSellerOrders ERROR:", err);

        res.status(500).json({
            error: "Failed to fetch orders"
        });

    }

};

// ================================
// 3️⃣ UPDATE ORDER STATUS
// ================================
const updateOrderStatus = async (req, res) => {
    const { id } = req.params; // Order ID
    const { status: action } = req.body; // The action from the button (e.g., 'Accepted')
    const sellerId = req.user.id;

    try {
        // 1. Verify this seller actually owns an item in this order
        const [check] = await pool.query(
            `SELECT * FROM order_items 
             WHERE order_id=? AND seller_id=?`,
            [id, sellerId]
        );

        if (check.length === 0) {
            return res.status(403).json({ error: "Unauthorized: You do not have items in this order" });
        }

        // 2. Map Seller Actions to Customer-Facing Statuses (Requirements 3.2.7 & 3.3.3)
        let dbStatus;
        switch (action) {
            case 'Accepted':
                dbStatus = 'confirmed'; // Requirement 3.2.7: Confirmed
                break;
            case 'Rejected':
                dbStatus = 'cancelled'; // Requirement 3.2.7: Cancelled
                break;
            case 'Shipped':
                dbStatus = 'shipped';   // Requirement 3.2.7: Shipped
                break;
            case 'Delivered':
                dbStatus = 'delivered'; // Requirement 3.2.7: Delivered
                break;
            default:
                dbStatus = action.toLowerCase(); // Fallback for other direct status updates
        }

        // 3. Update the database with the valid ENUM value
        await pool.query(
            `UPDATE orders SET status=? WHERE id=?`,
            [dbStatus, id]
        );

        res.json({
            success: true,
            message: `Order successfully updated to: ${dbStatus}`
        });

    } catch (err) {
        console.error("updateOrderStatus ERROR:", err);
        res.status(500).json({
            error: "Status update failed",
            details: err.message
        });
    }
};

// ================================
// 4️⃣ REQUEST PAYOUT
// ================================
const requestPayout = async (req, res) => {
    const { amount } = req.body;
    const sellerId = req.user.id;

    try {
        // ✅ FIX: Convert amount to NUMBER
        const safeAmount = parseFloat(amount);
        if (isNaN(safeAmount) || safeAmount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const [user] = await pool.query(
            `SELECT wallet_balance FROM users WHERE id=? FOR UPDATE`,
            [sellerId]
        );

        const balance = parseFloat(user[0]?.wallet_balance || 0);
        
        console.log(`Balance: ${balance}, Request: ${safeAmount}`); // DEBUG

        if (safeAmount > balance) {
            return res.status(400).json({ 
                error: `Insufficient balance. Available: ETB ${balance.toFixed(2)}` 
            });
        }

        // Use transaction for safety
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `UPDATE users SET wallet_balance = wallet_balance - ? WHERE id=?`,
                [safeAmount, sellerId]
            );

            await connection.query(
                `INSERT INTO withdrawals (seller_id, amount, status, requested_at) 
                 VALUES (?, ?, 'pending', NOW())`,
                [sellerId, safeAmount]
            );

            await connection.commit();
            res.json({ 
                success: true, 
                message: `ETB ${safeAmount.toFixed(2)} payout requested successfully!` 
            });
        } catch (txErr) {
            await connection.rollback();
            throw txErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Payout error:", err);
        res.status(500).json({ error: "Payout request failed" });
    }
};


// ================================
// 5️⃣ ADD PRODUCT
// ================================
const addProduct = async (req, res) => {

const connection = await pool.getConnection();


try {

const sellerId = req.user.id;

const {
name,
description,
category_id,
base_price,
discount_price,
weight,
dimensions,
brand_id,
tags,
images,

} = req.body;

await connection.beginTransaction();

/* -------------------------------
CALCULATE TOTAL STOCK FROM VARIANTS
--------------------------------*/

let totalStock = 0;
let variants = [];

if (req.body.variants) {
    try {
        variants = JSON.parse(req.body.variants);
    } catch (err) {
        console.error("Variants parse error:", err);
        variants = [];
    }
}
totalStock = variants.reduce(
    (sum, v) => sum + Number(v.stock_quantity || 0),
    0
);
/* -------------------------------
HANDLE IMAGE UPLOAD
--------------------------------*/

let uploadedImages = null;

if (req.files && req.files.length > 0) {
    uploadedImages = JSON.stringify(
        req.files.map(file => file.filename)
    );
}

/* -------------------------------
INSERT PRODUCT
--------------------------------*/

const [result] = await connection.query(
`INSERT INTO products
(seller_id, category_id, name, description,
base_price, discount_price, weight, dimensions,
brand_id, tags, images, stock_quantity, status)

VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
[
sellerId,
category_id,
name,
description,
Number(base_price),
discount_price || null,
weight || null,
dimensions || null,
brand_id || null,
Array.isArray(tags) ? tags.join(',') : null,
uploadedImages,
totalStock,
'pending'
]
);
const productId = result.insertId;

/* -------------------------------
INSERT VARIANTS
--------------------------------*/

if (variants && variants.length > 0) {
    for (const v of variants) {
        const variantSku = v.sku || `SKU-${productId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await connection.query(
            `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES (?,?,?,?,?,?)`,
            [productId, variantSku, v.size || null, v.color || null, v.price || base_price, Number(v.stock_quantity || 0)]
        );
    }
} else {
    // 🔥 FIX: If no variants provided, create a DEFAULT variant so checkout works!
    const defaultSku = `SKU-${productId}-DEFAULT`;
    await connection.query(
        `INSERT INTO product_variants (product_id, sku, price, stock_quantity) VALUES (?,?,?,?)`,
        [productId, defaultSku, Number(base_price), Number(totalStock || 0)]
    );
}



await connection.commit();

res.json({
success: true,
productId
});

} catch (err) {

await connection.rollback();

console.error("addProduct ERROR:", err);

res.status(500).json({
error: err.message
});

} finally {

connection.release();

}

};
// ================================
// 6️⃣ DELETE PRODUCT
// ================================
const deleteProduct = async (req, res) => {

    const { id } = req.params;
    const sellerId = req.user.id;

    try {

        await pool.query(
            `DELETE FROM product_variants WHERE product_id=?`,
            [id]
        );

        await pool.query(
            `DELETE FROM products WHERE id=? AND seller_id=?`,
            [id, sellerId]
        );

        res.json({
            success: true,
            message: "Product deleted"
        });

    } catch (err) {

        console.error("deleteProduct ERROR:", err);

        res.status(500).json({
            error: err.message
        });

    }

};



// Edit Product
// ================================
// EDIT PRODUCT (MYSQL VERSION)
// ================================
const editProduct = async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const sellerId = req.user.id;
        const productId = req.params.id;

       const {
name,
description,
category_id,
base_price,
discount_price,
weight,
dimensions,
brand_id,
tags
} = req.body;

        await connection.beginTransaction();

        // Check product ownership
        const [check] = await connection.query(
            `SELECT id FROM products WHERE id=? AND seller_id=?`,
            [productId, sellerId]
        );

        if (check.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                error: "Unauthorized or product not found"
            });
        }

        // Update product
await connection.query(
`UPDATE products SET
    name=?,
    description=?,
    category_id=?,
    base_price=?,
    discount_price=?,
    weight=?,
    dimensions=?,
    brand_id=?,
    tags=?,
    images=? -- Changed from image_urls to images
WHERE id=? AND seller_id=?`,
[
    name,
    description,
    category_id,
    base_price,
    discount_price || null,
    weight || null,
    dimensions || null,
    brand_id || null,
    tags ? tags.join(',') : null,
    req.files?.length > 0 ? JSON.stringify(req.files.map(f => f.filename)) : null,
    productId,
    sellerId
]
);
        await connection.commit();

        res.json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (err) {

        await connection.rollback();

        console.error("editProduct ERROR:", err);

        res.status(500).json({
            error: err.message
        });

    } finally {

        connection.release();

    }
};
// ================================
// 7️⃣ CREATE PROMOTION
// ================================
const createPromotion = async (req, res) => {

    const sellerId = req.user.id;

    const {
        product_id,
        discount_percentage,
        start_date,
        end_date
    } = req.body;

    try {

        await pool.query(
            `INSERT INTO promotions
            (seller_id, product_id, discount_percentage, start_date, end_date)
            VALUES (?,?,?,?,?)`,
            [
                sellerId,
                product_id,
                discount_percentage,
                start_date,
                end_date
            ]
        );

        res.json({
            success: true,
            message: "Promotion created"
        });

    } catch (err) {

        console.error("createPromotion ERROR:", err);

        res.status(500).json({
            error: err.message
        });

    }

};

// ================================
// EXPORTS
// ================================
module.exports = {

    getInventory,
    getSellerStats,
    getSellerOrders,
    updateOrderStatus,
    requestPayout,

    addProduct,
    editProduct,
    deleteProduct,

    createPromotion

};