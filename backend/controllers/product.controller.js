const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// ================================
// UTILITY: IMAGE URL FIXER
// ================================
const getImageUrl = (image_url) => {
    if (!image_url) return null;

    if (image_url.startsWith('http')) return image_url;

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

    return `${BASE_URL}/uploads/products/${path.basename(image_url)}`;
};

// ================================
// SAFE JSON PARSER
// ================================
const safeJSON = (data) => {
    try {
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// ================================
// 1. GET ALL PRODUCTS (WITH VARIANTS & RATINGS)
// ================================
const getAllProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        // 1. ADDED keyword HERE
        const { sort, category, minPrice, maxPrice, rating, keyword } = req.query;

        const offset = (page - 1) * limit;

        let whereClauses = ["p.status='approved'"];
        let queryParams = [];

        // 2. ADDED KEYWORD FILTER
        if (keyword && keyword.trim() !== '') {
            whereClauses.push("(p.name LIKE ? OR p.description LIKE ?)");
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (category && category !== 'All') {
            whereClauses.push("c.name=?");
            queryParams.push(category);
        }

        if (minPrice) {
            whereClauses.push("pv.price >= ?");
            queryParams.push(Number(minPrice));
        }

        if (maxPrice) {
            whereClauses.push("pv.price <= ?");
            queryParams.push(Number(maxPrice));
        }

        let sql = `
            SELECT p.*, u.business_name, c.name as category_name,
                   COALESCE(AVG(r.rating),0) as avg_rating,
                   COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN users u ON p.seller_id=u.id
            LEFT JOIN categories c ON p.category_id=c.id
            LEFT JOIN reviews r ON p.id=r.product_id AND r.is_approved=1
            LEFT JOIN product_variants pv ON p.id=pv.product_id
            WHERE ${whereClauses.join(' AND ')}
            GROUP BY p.id
        `;

        if (rating) {
            sql += " HAVING avg_rating >= ?";
            queryParams.push(Number(rating));
        }

        // Sorting
        if (sort === 'newest') sql += " ORDER BY p.created_at DESC";
        else if (sort === 'priceLow') sql += " ORDER BY MIN(pv.price) ASC";
        else if (sort === 'priceHigh') sql += " ORDER BY MAX(pv.price) DESC";
        else if (sort === 'ratingHigh') sql += " ORDER BY avg_rating DESC, review_count DESC";
        else if (sort === 'featured') sql += " ORDER BY p.is_featured DESC, p.created_at DESC";
        else sql += " ORDER BY p.created_at DESC";

        // 3. FIX: Capture parameters for Count query BEFORE adding LIMIT/OFFSET
        const countParams = [...queryParams];

        sql += " LIMIT ? OFFSET ?";
        queryParams.push(limit, offset);

        const [products] = await pool.query(sql, queryParams);

        // ================================
        // LOAD VARIANTS (Your original logic)
        // ================================
        if (products.length > 0) {
            const productIds = products.map(p => p.id);
            const [variants] = await pool.query(
                'SELECT * FROM product_variants WHERE product_id IN (?)',
                [productIds]
            );

            const variantMap = {};
            variants.forEach(v => {
                if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
                variantMap[v.product_id].push({
                    id: v.id,
                    sku: v.sku,
                    size: v.size,
                    color: v.color,
                    price: v.price,
                    stock_quantity: v.stock_quantity,
                });
            });

            products.forEach(p => {
                p.variants = variantMap[p.id] || [];
                const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
                p.images = Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [];
                p.category = p.category_name ? p.category_name : 'Uncategorized';
                p.avg_rating = parseFloat(p.avg_rating) || 0;

                if (p.variants.length > 0) {
                    const validVariants = p.variants.filter(v => v.price != null);
                    p.price = validVariants.length ? validVariants[0].price : p.base_price || 0;
                    p.stock = p.variants.reduce((acc, v) => acc + (Number(v.stock_quantity) || 0), 0);
                } else {
                    p.price = Number(p.base_price) || 0;
                    p.stock = Number(p.stock_quantity) || 0;
                }
            });
        }

        // ================================
        // TOTAL COUNT (Fixed param handling)
        // ================================
        const [totalCountResult] = await pool.query(`
            SELECT COUNT(DISTINCT p.id) as total
            FROM products p
            LEFT JOIN product_variants pv ON p.id=pv.product_id
            LEFT JOIN categories c ON p.category_id=c.id
            WHERE ${whereClauses.join(' AND ')}
        `, countParams);

        res.json({
            products,
            pagination: {
                page,
                limit,
                total: totalCountResult[0].total,
                totalPages: Math.ceil(totalCountResult[0].total / limit)
            }
        });

    } catch (err) {
        console.error('Get all products ERROR:', err);
        res.status(500).json({ error: err.message });
    }
};
// 
const getFeaturedProducts = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, u.business_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'approved' AND p.is_featured = 1
            ORDER BY p.avg_rating DESC
            LIMIT 8
        `);

        products.forEach(p => {
            const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
            p.images = Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [];
            p.price = p.base_price;
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//
const getNewArrivals = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, 
            (SELECT MIN(price) FROM product_variants WHERE product_id = p.id) as variant_price
            FROM products p
            WHERE p.status='approved'
            ORDER BY p.created_at DESC
            LIMIT 8
        `);

        products.forEach(p => {
            const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
            p.images = Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [];
            // ✅ Fix: Use variant price
            p.price = p.variant_price || p.base_price || 0;
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//

const getBestSellers = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT 
                p.*, 
                u.business_name,
                COALESCE(SUM(oi.quantity), 0) as total_sold
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'approved'
            GROUP BY p.id
            ORDER BY total_sold DESC, p.created_at DESC
            LIMIT 8
        `);

        products.forEach(p => {
            const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
            p.images = Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [];
            p.price = p.base_price; // Fallback to base_price
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//

const getFlashSales = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT 
                p.*, 
                u.business_name, 
                fsp.sale_price as flash_price, 
                fsp.quantity_limit, 
                fsp.sold_quantity
            FROM products p
            JOIN flash_sale_products fsp ON p.id = fsp.product_id
            JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE fs.status = 'active' 
              AND NOW() BETWEEN fs.start_time AND fs.end_time
              AND p.status = 'approved'
            LIMIT 8
        `);

        const formattedProducts = products.map(p => {
            const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
            
            return {
                ...p,
                // Ensure images is always an array for the frontend .length check
                images: Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [],
                // This matches your Home.jsx style for 'originalPrice'
                original_price: p.base_price, 
                // This matches your Home.jsx style for 'currentPrice'
                price: p.flash_price || p.base_price, 
                // This calculates the red badge percentage
                discount_percent: p.base_price > 0 
                    ? Math.round(((p.base_price - p.flash_price) / p.base_price) * 100) 
                    : 0
            };
        });

        // Send as a plain array because your frontend checks Array.isArray(flash.data)
        res.json(formattedProducts); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ================================
// 2. SEARCH PRODUCTS
// ================================
const searchProducts = getAllProducts;


// ================================
// 3. GET PRODUCT DETAILS
// ================================
const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await pool.query(
            `SELECT p.*, u.business_name, c.name as category_name,
                    COALESCE(AVG(r.rating),0) as avg_rating,
                    COUNT(r.id) as review_count
             FROM products p
             LEFT JOIN users u ON p.seller_id=u.id
             LEFT JOIN categories c ON p.category_id=c.id
             LEFT JOIN reviews r ON p.id=r.product_id AND r.is_approved=1
             LEFT JOIN product_variants pv ON p.id=pv.product_id
             WHERE p.id=?
             GROUP BY p.id`,
            [id]
        );

        if (!results.length)
            return res.status(404).json({ error: 'Product not found' });

        const product = results[0];

        const [variants] = await pool.query(
            'SELECT * FROM product_variants WHERE product_id=?',
            [id]
        );

        product.variants = variants.map(v => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: v.price,
            stock_quantity: v.stock_quantity,
        }));

        // ✅ FIXED IMAGE LOGIC: 
        // Handles both JSON strings and comma-separated strings safely
        const rawImages = typeof product.images === 'string' ? safeJSON(product.images) : product.images;
        
        if (Array.isArray(rawImages)) {
            product.images = rawImages.map(img => getImageUrl(img));
        } else if (typeof product.images === 'string' && product.images.length > 0) {
            // Fallback for simple comma-separated strings
            product.images = product.images.split(',').map(img => getImageUrl(img.trim()));
        } else {
            product.images = [];
        }

        product.category = product.category_name || 'Uncategorized';
        product.avg_rating = parseFloat(product.avg_rating) || 0;

        res.json(product);

    } catch (err) {
        console.error('Get product details error:', err);
        res.status(500).json({ error: err.message });
    }
};


// ================================
// 4. GET SELLER PRODUCTS
// ================================
const getSellerProducts = async (req, res) => {

    try {

        const sellerId = req.user?.id || req.params.sellerId;

        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name,
                    COALESCE(AVG(r.rating),0) as avg_rating,
                    COUNT(r.id) as review_count
             FROM products p
             LEFT JOIN categories c ON p.category_id=c.id
             LEFT JOIN reviews r ON p.id=r.product_id AND r.is_approved=1
             LEFT JOIN product_variants pv ON p.id=pv.product_id
             WHERE p.seller_id=?
             GROUP BY p.id`,
            [sellerId]
        );

        if (products.length) {

            const productIds = products.map(p => p.id);

            const [variants] = await pool.query(
                'SELECT * FROM product_variants WHERE product_id IN (?)',
                [productIds]
            );

            const variantMap = {};

            variants.forEach(v => {

                if (!variantMap[v.product_id])
                    variantMap[v.product_id] = [];

                variantMap[v.product_id].push({
                    id: v.id,
                    sku: v.sku,
                    size: v.size,
                    color: v.color,
                    price: v.price,
                    stock_quantity: v.stock_quantity,
                   
                });

            });

            products.forEach(p => {

                p.variants = variantMap[p.id] || [];

       const rawImages = typeof p.images === 'string' ? safeJSON(p.images) : p.images;
p.images = Array.isArray(rawImages) ? rawImages.map(img => getImageUrl(img)) : [];

                p.category = p.category_name ? p.category_name : 'Uncategorized';

                p.avg_rating = parseFloat(p.avg_rating) || 0;

                if (p.variants.length > 0) {

    const validVariants = p.variants.filter(v => v.price != null);

    p.price = validVariants.length
        ? validVariants[0].price
        : p.base_price || 0;

    p.stock = p.variants.length
    ? p.variants.reduce(
        (acc, v) => acc + (Number(v.stock_quantity) || 0),
        0
      )
    : Number(p.stock_quantity) || 0;

} else {

    p.price = Number(p.base_price) || 0;
    p.stock = 0;

}

            });

        }

        res.json(products);

    } catch (err) {
        console.error('Get seller products error:', err);
        res.status(500).json({ error: err.message });
    }
};


// ================================
// 5. GET PRODUCT RATINGS
// ================================
const getProductRatings = async (req, res) => {

    try {

        const { id } = req.params;

        const [reviews] = await pool.query(
            `SELECT r.*, u.name as customer_name
             FROM reviews r
             JOIN users u ON r.customer_id=u.id
             WHERE r.product_id=? AND r.is_approved=1
             ORDER BY r.created_at DESC`,
            [id]
        );

        const [stats] = await pool.query(
            `SELECT AVG(rating) as avg_rating,
                    COUNT(*) as total_reviews
             FROM reviews
             WHERE product_id=? AND is_approved=1`,
            [id]
        );

        res.json({
            reviews,
            stats: stats[0]
        });

    } catch (err) {

        console.error('Get product ratings error:', err);

        res.status(500).json({ error: err.message });
    }
};


// ================================
// 6. ADD REVIEW
// ================================
const addReview = async (req, res) => {

    const { product_id, rating, comment } = req.body;
    const customer_id = req.user.id;

    try {

        const [existing] = await pool.query(
            'SELECT id FROM reviews WHERE product_id=? AND customer_id=?',
            [product_id, customer_id]
        );

        if (existing.length)
            return res.status(400).json({ error: 'You already reviewed this product' });

        await pool.query(
            `INSERT INTO reviews (product_id, customer_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [product_id, customer_id, rating, comment || '']
        );

        res.json({
            success: true,
            message: 'Review added!'
        });

    } catch (err) {

        console.error('Add review error:', err);

        res.status(500).json({ error: err.message });
    }
};


// ================================
// 7. ADD PRODUCT
// ================================
const addProduct = async (req, res) => {
    try {
        const { name, description, category_id,brand_id, base_price, variants } = req.body;
        const seller_id = req.user.id;

        // ==========================================
        // 1. GATEKEEPER CHECK (Professional Requirement)
        // ==========================================
        // If the seller is not yet approved by the Admin, they cannot post.
        if (req.user.role === 'seller' && req.user.is_approved !== 1) {
            return res.status(403).json({ 
                error: 'Account Pending: You cannot add products until an Admin approves your seller account.' 
            });
        }

        // ==========================================
        // 2. IMAGE URL HANDLING
        // ==========================================
        const images = req.files && req.files.length > 0
            ? req.files.map(file => file.filename)
            : [];

        // ==========================================
        // 3. INSERT MAIN PRODUCT
        // ==========================================
     const [result] = await pool.query(
    `INSERT INTO products 
    (seller_id, category_id, brand_id, name, description, base_price, status, images) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
        seller_id,
        category_id,
        brand_id || null,
        name,
        description,
        base_price,
        'pending',
        JSON.stringify(images)
    ]
);
 
        const productId = result.insertId;

        // ==========================================
        // 4. INSERT PRODUCT VARIANTS (Original Logic)
        // ==========================================
        // We parse variants if they come as a string (happens with FormData/Multer)
        let productVariants = variants;
        if (typeof variants === 'string') {
            try { productVariants = JSON.parse(variants); } catch (e) { productVariants = []; }
        }

        if (Array.isArray(productVariants) && productVariants.length > 0) {
            for (const v of productVariants) {
               await pool.query(
    `INSERT INTO product_variants 
    (product_id, sku, size, color, price, stock_quantity) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
        productId,
        v.sku,
        v.size,
        v.color,
        v.price,
        v.stock_quantity
    ]
);
            }
        }

        res.json({
            success: true,
            message: 'Product submitted for review!',
            productId
        });

    } catch (err) {
        console.error('Add product error:', err);
        res.status(500).json({ error: err.message });
    }
};


// ================================
// EDIT PRODUCT
// ================================
const editProduct = async (req, res) => {
    const { id } = req.params;
    const seller_id = req.user.id;
    const { name, description, category_id, brand_id,base_price, variants } = req.body;

    try {
        // ==========================================
        // 1. GATEKEEPER CHECK (Security)
        // ==========================================
        // Even if editing, we ensure the seller is currently approved.
        if (req.user.role === 'seller' && req.user.is_approved !== 1) {
            return res.status(403).json({ 
                error: 'Unauthorized: Your seller account is not approved by the admin.' 
            });
        }

        // ==========================================
        // 2. FETCH EXISTING PRODUCT & PERMISSION CHECK
        // ==========================================
        const [product] = await pool.query(
            'SELECT * FROM products WHERE id=? AND seller_id=?',
            [id, seller_id]
        );

        if (!product.length) {
            return res.status(403).json({ error: 'Unauthorized: Product not found or not yours.' });
        }

        // ==========================================
        // 3. IMAGE HANDLING (Professional Logic)
        // ==========================================
        // If new files are uploaded, use them. Otherwise, keep existing ones.
let updated_images;
if (req.files && req.files.length > 0) {
    updated_images = JSON.stringify(req.files.map(file => file.filename)); // Stringify for JSON column
} else {
    updated_images = product[0].images; 
}

await pool.query(
    `UPDATE products 
     SET name=?, description=?, category_id=?, brand_id=?, base_price=?, images=?, status='pending' 
     WHERE id=?`,
    [name, description, category_id, brand_id || null, base_price, updated_images, id]
);
        // ==========================================
        // 5. UPDATE VARIANTS (Original Logic)
        // ==========================================
        // We parse variants if they come as a JSON string from FormData
        let productVariants = variants;
        if (typeof variants === 'string') {
            try { productVariants = JSON.parse(variants); } catch (e) { productVariants = null; }
        }

        if (Array.isArray(productVariants)) {
            // Delete old variants first
            await pool.query('DELETE FROM product_variants WHERE product_id=?', [id]);

            // Insert updated variants
            // Insert updated variants (Removed attributes)
for (const v of productVariants) {
    await pool.query(
        `INSERT INTO product_variants 
        (product_id, sku, size, color, price, stock_quantity) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            id,
            v.sku,
            v.size,
            v.color,
            v.price,
            v.stock_quantity
        ]
    );
}
        }

        res.json({
            success: true,
            message: 'Product updated successfully and sent for review!'
        });

    } catch (err) {
        console.error('Edit product error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ================================
// DELETE PRODUCT
// ================================
const deleteProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const [product] = await pool.query(
            "SELECT images FROM products WHERE id=?",
            [id]
        );

// ==========================================
// CORRECTED IMAGE DELETION LOGIC (JSON COMPATIBLE)
// ==========================================
if (product.length && product[0].images) {
    let images = [];
    
    try {
        // Handle both stringified JSON and already parsed objects
        images = typeof product[0].images === 'string' 
            ? JSON.parse(product[0].images) 
            : product[0].images;
    } catch (e) {
        console.error("Error parsing product images JSON:", e);
        images = [];
    }

    // Ensure images is an array before looping
    if (Array.isArray(images)) {
        images.forEach(img => {
            // path.basename ensures we don't accidentally delete files outside the folder
            const fileName = path.basename(img); 
            const filePath = path.join(
                __dirname,
                '../uploads/products',
                fileName
            );

            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Failed to delete file: ${filePath}`, err);
                }
            }
        });
    }
}

await pool.query(
    "DELETE FROM products WHERE id=? AND seller_id=?",
    [id, req.user.id] 
);
        res.json({
            success: true,
            message: "Product deleted!"
        });

    } catch (err) {

        console.error("Delete product error:", err);

        res.status(500).json({
            error: err.message
        });
    }
};
//

const getPendingProducts = async (req, res) => {
    try {

        const [products] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.base_price,
                p.status,
                p.created_at,
                u.business_name,
                c.name as category_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status='pending'
            ORDER BY p.created_at DESC
        `);

        res.json(products);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Failed to fetch pending products" });

    }
};
//
const approveProduct = async (req, res) => {

    try {

        await pool.query(
            "UPDATE products SET status='approved' WHERE id=?",
            [req.params.id]
        );

        res.json({
            success: true,
            message: "Product approved successfully"
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Product approval failed" });

    }

};
//
const rejectProduct = async (req, res) => {

    try {

        await pool.query(
            "UPDATE products SET status='rejected' WHERE id=?",
            [req.params.id]
        );

        res.json({
            success: true,
            message: "Product rejected"
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Product rejection failed" });

    }

};



// ================================
// EXPORT
// ================================
module.exports = {
    getAllProducts,
    searchProducts,
    getProductDetails,
    getSellerProducts,
    getProductRatings,
    addReview,
    addProduct,
    editProduct,
    deleteProduct,

    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    getFlashSales,

    getPendingProducts,
    approveProduct,
    rejectProduct
};