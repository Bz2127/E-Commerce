const { pool } = require("../config/db");

// banner.controller.js
exports.getBanners = async (req, res) => {
  try {
    // We fetch exactly what the DB has
    const [rows] = await pool.query(
      "SELECT id, title, image_url, link_url, is_active FROM homepage_banners WHERE is_active = 1"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    // Match the frontend keys to the DB columns
    const { title, image_url, link_url } = req.body;
    await pool.query(
      "INSERT INTO homepage_banners (title, image_url, link_url) VALUES (?, ?, ?)",
      [title, image_url, link_url]
    );
    res.json({ message: "Banner created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM homepage_banners WHERE id = ?",
      [id]
    );

    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};