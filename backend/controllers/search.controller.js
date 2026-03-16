const { pool } = require('../config/db');

exports.searchProducts = async (req, res) => {
  try {
    const { keyword, sku, minPrice, maxPrice, category, brand, sort } = req.query;

    let query = `
      SELECT p.*, b.name as brand_name, c.name as category_name 
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;

    const params = [];

    if (keyword) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (sku) {
      query += ` AND p.sku = ?`;
      params.push(sku);
    }

    if (minPrice) {
      query += ` AND p.base_price >= ?`;
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND p.base_price <= ?`;
      params.push(maxPrice);
    }

    if (category) {
      query += ` AND p.category_id = ?`;
      params.push(category);
    }

    if (brand) {
      query += ` AND b.id = ?`;
      params.push(brand);
    }

    if (sort === 'price_asc') query += ` ORDER BY p.base_price ASC`;
    else if (sort === 'price_desc') query += ` ORDER BY p.base_price DESC`;
    else if (sort === 'newest') query += ` ORDER BY p.created_at DESC`;
    else if (sort === 'rating') query += ` ORDER BY p.avg_rating DESC`;

    const [products] = await pool.execute(query, params);

    res.json({
      success: true,
      results: products
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

exports.searchSuggestion = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.json([]);

    const [products] = await pool.execute(
      `SELECT name FROM products 
       WHERE name LIKE ? AND status = 'active' 
       LIMIT 8`,
      [`%${keyword}%`]
    );

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Suggestion error" });
  }
};