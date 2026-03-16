const { pool: db } = require('../config/db');

// ======================================================
// CREATE BRAND
// ======================================================
exports.createBrand = async (req, res) => {
  try {

    const { name, logo } = req.body;

    const [result] = await db.execute(
      "INSERT INTO brands (name, logo) VALUES (?, ?)",
      [name, logo]
    );

    res.json({
      success: true,
      message: "Brand created successfully",
      brand_id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating brand" });
  }
};



// ======================================================
// GET ALL BRANDS
// ======================================================
exports.getBrands = async (req, res) => {
  try {

    const [brands] = await db.execute(
      "SELECT * FROM brands ORDER BY created_at DESC"
    );

    res.json(brands);

  } catch (error) {
    res.status(500).json({ message: "Error fetching brands" });
  }
};



// ======================================================
// GET SINGLE BRAND
// ======================================================
exports.getBrandById = async (req, res) => {
  try {

    const { id } = req.params;

    const [brand] = await db.execute(
      "SELECT * FROM brands WHERE id = ?",
      [id]
    );

    if (brand.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json(brand[0]);

  } catch (error) {
    res.status(500).json({ message: "Error fetching brand" });
  }
};



// ======================================================
// UPDATE BRAND
// ======================================================
exports.updateBrand = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, logo } = req.body;

    await db.execute(
      "UPDATE brands SET name = ?, logo = ? WHERE id = ?",
      [name, logo, id]
    );

    res.json({
      success: true,
      message: "Brand updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating brand" });
  }
};



// ======================================================
// DELETE BRAND
// ======================================================
exports.deleteBrand = async (req, res) => {
  try {

    const { id } = req.params;

    await db.execute(
      "DELETE FROM brands WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Brand deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Error deleting brand" });
  }
};