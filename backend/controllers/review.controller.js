const { pool } = require('../config/db');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ================================
// Utility: Fix Image URL
// ================================
const fixImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}/uploads/${path.basename(img)}`;
};

// ================================
// 1️⃣ ADD REVIEW
// ================================
const addReview = async (req, res) => {
  try {

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ error: 'Product and rating required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check product exists
    const [product] = await pool.query(
      `SELECT id FROM products WHERE id=?`,
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check purchase
    const [orderItems] = await pool.query(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON oi.order_id=o.id
       WHERE o.customer_id=?
       AND oi.variant_id IN (
           SELECT id FROM product_variants WHERE product_id=?
       )
       AND o.status='delivered'`,
      [req.user.id, product_id]
    );

    if (orderItems.length === 0) {
      return res.status(403).json({
        error: 'You must purchase and receive the product before reviewing'
      });
    }

    // Prevent duplicate review
    const [existing] = await pool.query(
      `SELECT id FROM reviews
       WHERE customer_id=? AND product_id=?`,
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'You already reviewed this product'
      });
    }

    await pool.query(
      `INSERT INTO reviews
       (product_id, customer_id, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, 1)`,
      [product_id, req.user.id, rating, comment || null]
    );

    res.json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (err) {

    console.error('Add review error:', err);

    res.status(500).json({
      error: 'Failed to submit review'
    });

  }
};

// ================================
// 2️⃣ GET PRODUCT REVIEWS
// ================================
const getProductReviews = async (req, res) => {

  try {

    const productId = req.params.product_id;

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as customer_name
       FROM reviews r
       JOIN users u ON r.customer_id=u.id
       WHERE r.product_id=? AND r.is_approved=1
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    const [ratingStats] = await pool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END) as one_star
       FROM reviews
       WHERE product_id=? AND is_approved=1`,
      [productId]
    );

    res.json({
      reviews,
      stats: ratingStats[0],
      pagination: {
        page,
        limit
      }
    });

  } catch (err) {

    console.error('Get reviews error:', err);

    res.status(500).json({
      error: 'Failed to fetch reviews'
    });

  }

};

// ================================
// 3️⃣ REPORT REVIEW
// ================================
const reportReview = async (req, res) => {

  try {

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { review_id, reason } = req.body;

    if (!review_id) {
      return res.status(400).json({ error: 'Review ID required' });
    }

    await pool.query(
      `UPDATE reviews SET is_approved=0 WHERE id=?`,
      [review_id]
    );

    res.json({
      success: true,
      message: 'Review reported to admin'
    });

  } catch (err) {

    console.error('Report review error:', err);

    res.status(500).json({
      error: 'Failed to report review'
    });

  }

};

// ================================
// 4️⃣ GET CUSTOMER REVIEWS
// ================================
const getCustomerReviews = async (req, res) => {

  try {

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [reviews] = await pool.query(
      `SELECT 
        r.*,
        p.name as product_name,
        p.image_url
       FROM reviews r
       JOIN products p ON r.product_id=p.id
       WHERE r.customer_id=?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    reviews.forEach(r => {
      r.image_url = fixImageUrl(r.image_url);
    });

    res.json({
      reviews
    });

  } catch (err) {

    console.error('Get customer reviews error:', err);

    res.status(500).json({
      error: 'Failed to fetch your reviews'
    });

  }

};

// ================================
// 5️⃣ DELETE REVIEW (NEW)
// ================================
const deleteReview = async (req, res) => {

  try {

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const reviewId = req.params.id;

    await pool.query(
      `DELETE FROM reviews
       WHERE id=? AND customer_id=?`,
      [reviewId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Review deleted'
    });

  } catch (err) {

    console.error('Delete review error:', err);

    res.status(500).json({
      error: 'Failed to delete review'
    });

  }

};

// ================================
// EXPORT
// ================================
module.exports = {
  addReview,
  getProductReviews,
  reportReview,
  getCustomerReviews,
  deleteReview
};