const { pool } = require('../config/db');


// ======================================================
// CREATE ATTRIBUTE (Color, Size, Material)
// ======================================================
exports.createAttribute = async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO attributes (name) VALUES (?)",
      [name]
    );

    res.json({
      success: true,
      message: "Attribute created successfully",
      attribute_id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating attribute" });
  }
};


// ======================================================
// GET ALL ATTRIBUTES
// ======================================================
exports.getAttributes = async (req, res) => {
  try {

    const [rows] = await pool.execute(`
      SELECT 
        a.id,
        a.name,
        COUNT(av.id) AS value_count
      FROM attributes a
      LEFT JOIN attribute_values av
      ON a.id = av.attribute_id
      GROUP BY a.id
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("GET ATTRIBUTES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ======================================================
// UPDATE ATTRIBUTE
// ======================================================
exports.updateAttribute = async (req, res) => {
  try {

    const { id } = req.params;
    const { name } = req.body;

    await pool.execute(
      "UPDATE attributes SET name=? WHERE id=?",
      [name, id]
    );

    res.json({
      success: true,
      message: "Attribute updated"
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating attribute" });
  }
};


// ======================================================
// DELETE ATTRIBUTE
// ======================================================
exports.deleteAttribute = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.execute(
      "DELETE FROM attributes WHERE id=?",
      [id]
    );

    res.json({
      success: true,
      message: "Attribute deleted"
    });

  } catch (error) {
    res.status(500).json({ message: "Error deleting attribute" });
  }
};


// ======================================================
// ADD ATTRIBUTE VALUE (Red, Blue, XL)
// ======================================================
exports.addAttributeValue = async (req, res) => {
  try {

    const { attribute_id, value } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO attribute_values (attribute_id,value) VALUES (?,?)",
      [attribute_id, value]
    );

    res.json({
      success: true,
      message: "Attribute value added",
      id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: "Error adding attribute value" });
  }
};
// ======================================================
// DELETE ATTRIBUTE VALUE
// ======================================================
exports.deleteAttributeValue = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.execute(
      "DELETE FROM attribute_values WHERE id=?",
      [id]
    );

    res.json({
      success: true,
      message: "Attribute value deleted"
    });

  } catch (error) {
    res.status(500).json({ message: "Error deleting attribute value" });
  }
};


// ======================================================
// GET ATTRIBUTE VALUES
// ======================================================
exports.getAttributeValues = async (req, res) => {
  try {

    const { attribute_id } = req.params;

    const [rows] = await pool.execute(
      "SELECT * FROM attribute_values WHERE attribute_id=?",
      [attribute_id]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching values" });
  }
};


// ======================================================
// ASSIGN ATTRIBUTE VALUE TO PRODUCT
// ======================================================
exports.assignAttributeToProduct = async (req, res) => {
  try {

    const { product_id, attribute_value_id } = req.body;

    await pool.execute(
      `INSERT INTO product_attribute_values 
       (product_id, attribute_value_id) 
       VALUES (?,?)`,
      [product_id, attribute_value_id]
    );

    res.json({
      success: true,
      message: "Attribute assigned to product"
    });

  } catch (error) {
    res.status(500).json({ message: "Error assigning attribute" });
  }
};