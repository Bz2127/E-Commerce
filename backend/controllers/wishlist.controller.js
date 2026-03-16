const { pool } = require('../config/db');
const path = require('path');

// Base URL for images
//const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ================================
// Utility: Fix image URL (SAFE VERSION)
// ================================================
const fixImageUrl = (imagesJson) => {
  if (!imagesJson) return null;
  
  // Fetch BASE_URL inside the function to ensure process.env is ready
  const currentBaseUrl = process.env.BASE_URL || 'http://localhost:5000';

  try {
    const images = typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson;
    
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      if (firstImage.startsWith('http')) return firstImage;
      
      // Clean the filename and build path
      const fileName = path.basename(firstImage);
      return `${currentBaseUrl}/uploads/products/${fileName}`;
    }
  } catch (e) {
    console.error("Image Parse Error:", e);
    return null;
  }
  return null;
};
// ================================
// 1️⃣ ADD TO WISHLIST
// ================================
const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const customer_id = req.user?.id;

    if (!customer_id) return res.status(401).json({ error: 'Authentication required' });
    if (!product_id) return res.status(400).json({ error: 'Product ID required' });

    // Check product exists
    const [product] = await pool.query(`SELECT id FROM products WHERE id=?`, [product_id]);
    if (product.length === 0) return res.status(404).json({ error: 'Product not found' });

    // Insert wishlist item (IGNORE prevents duplicates)
    await pool.query(
      `INSERT IGNORE INTO wishlist (customer_id, product_id) VALUES (?, ?)`,
      [customer_id, product_id]
    );

    // Return item with Brand Join and JSON images
    const [result] = await pool.query(`
      SELECT 
        w.*,
        p.name,
        p.images,
        b.name as brand_name,
        MIN(pv.price) as price
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE w.customer_id=? AND w.product_id=?
      GROUP BY w.id
    `, [customer_id, product_id]);

    if (result.length > 0) {
      result[0].image_url = fixImageUrl(result[0].images);
      result[0].brand = result[0].brand_name || 'Generic';
    }

    res.json({
      success: true,
      wishlistItem: result[0],
      message: 'Added to wishlist'
    });

  } catch (err) {
    console.error('Add wishlist error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

// ================================
// 2️⃣ REMOVE FROM WISHLIST
// ================================
const removeFromWishlist = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    const { product_id } = req.params;

    if (!customer_id) return res.status(401).json({ error: 'Authentication required' });

    await pool.query(
      `DELETE FROM wishlist WHERE customer_id=? AND product_id=?`,
      [customer_id, product_id]
    );

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

// ================================
// 3️⃣ GET WISHLIST (Fixed SQL & Logic)
// ================================
const getWishlist = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    if (!customer_id) return res.status(401).json({ error: 'Authentication required' });

   // Replace the SELECT query inside getWishlist
const [wishlist] = await pool.query(`
  SELECT 
    w.id as wishlist_id,
    p.id,
    p.name,
    p.images,
    b.name as brand_name,
    MIN(pv.price) as price,
    SUM(pv.stock_quantity) as stock_quantity,
    u.business_name
  FROM wishlist w
  JOIN products p ON w.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN product_variants pv ON p.id = pv.product_id
  LEFT JOIN users u ON p.seller_id = u.id
  WHERE w.customer_id = ? 
  GROUP BY p.id
  ORDER BY w.created_at DESC
`, [customer_id]);

// AND change the loop at the bottom to this:
const processedWishlist = wishlist.map(item => ({
  ...item,
  image_url: fixImageUrl(item.images),
  brand: item.brand_name || 'Generic' // Map brand_name to brand property
}));

res.json({ wishlist: processedWishlist });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

// ================================
// 4️⃣ WISHLIST COUNT
// ================================
const getWishlistCount = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    if (!customer_id) return res.status(401).json({ error: 'Authentication required' });

    const [count] = await pool.query(
      `SELECT COUNT(*) as total FROM wishlist WHERE customer_id=?`,
      [customer_id]
    );

    res.json({ count: count[0].total });
  } catch (err) {
    console.error('Wishlist count error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist count' });
  }
};
// ================================
// 5️⃣ CHECK INDIVIDUAL STATUS 
// ================================
const checkWishlistStatus = async (req, res) => {
  try {
    const customer_id = req.user?.id;
    const { product_id } = req.params;

    if (!customer_id) return res.json({ inWishlist: false });

    const [rows] = await pool.query(
      `SELECT id FROM wishlist WHERE customer_id = ? AND product_id = ?`,
      [customer_id, product_id]
    );

    res.json({ inWishlist: rows.length > 0 });
  } catch (err) {
    console.error('Check wishlist error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getWishlistCount,
  checkWishlistStatus
};