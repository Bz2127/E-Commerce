const { pool } = require("../config/db");


// =============================
// GET ALL CATEGORIES
// =============================
exports.getCategories = async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT id, name, slug, parent_id, image_url
      FROM categories
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.error("Category fetch error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });

  }
};



// =============================
// CREATE CATEGORY
// =============================
exports.createCategory = async (req, res) => {
  try {

    const { name, slug, parent_id, image_url } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO categories (name, slug, parent_id, image_url, is_active)
      VALUES (?, ?, ?, ?, 1)
      `,
      [name, slug || null, parent_id || null, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      categoryId: result.insertId
    });

  } catch (err) {

    console.error("Category create error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });

  }
};



// =============================
// DELETE CATEGORY
// =============================
exports.deleteCategory = async (req, res) => {
  try {

    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (err) {

    console.error("Category delete error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });

  }
};