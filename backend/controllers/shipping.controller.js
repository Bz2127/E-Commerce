const db = require('../config/db');


// ========================================
// CREATE SHIPPING ZONE
// ========================================
exports.createZone = async (req, res) => {
  try {

    const { zone_name, country, region } = req.body;

    const [result] = await db.execute(
      `INSERT INTO shipping_zones (zone_name, country, region)
       VALUES (?, ?, ?)`,
      [zone_name, country, region]
    );

    res.json({
      success: true,
      message: "Shipping zone created",
      zone_id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating zone" });
  }
};



// ========================================
// GET ALL SHIPPING ZONES
// ========================================
exports.getZones = async (req, res) => {
  try {

    const [zones] = await db.execute(
      "SELECT * FROM shipping_zones"
    );

    res.json(zones);

  } catch (error) {
    res.status(500).json({ message: "Error fetching zones" });
  }
};



// ========================================
// CREATE SHIPPING METHOD
// ========================================
exports.createMethod = async (req, res) => {
  try {

    const { zone_id, method_name, cost, estimated_days } = req.body;

    const [result] = await db.execute(
      `INSERT INTO shipping_methods
       (zone_id, method_name, cost, estimated_days)
       VALUES (?, ?, ?, ?)`,
      [zone_id, method_name, cost, estimated_days]
    );

    res.json({
      success: true,
      message: "Shipping method created",
      method_id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating shipping method" });
  }
};



// ========================================
// GET METHODS BY ZONE
// ========================================
exports.getMethodsByZone = async (req, res) => {
  try {

    const { zone_id } = req.params;

    const [methods] = await db.execute(
      `SELECT * FROM shipping_methods
       WHERE zone_id = ?`,
      [zone_id]
    );

    res.json(methods);

  } catch (error) {
    res.status(500).json({ message: "Error fetching methods" });
  }
};



// ========================================
// UPDATE SHIPPING METHOD
// ========================================
exports.updateMethod = async (req, res) => {
  try {

    const { id } = req.params;
    const { method_name, cost, estimated_days } = req.body;

    await db.execute(
      `UPDATE shipping_methods
       SET method_name=?, cost=?, estimated_days=?
       WHERE id=?`,
      [method_name, cost, estimated_days, id]
    );

    res.json({
      success: true,
      message: "Shipping method updated"
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating method" });
  }
};



// ========================================
// DELETE SHIPPING METHOD
// ========================================
exports.deleteMethod = async (req, res) => {
  try {

    const { id } = req.params;

    await db.execute(
      "DELETE FROM shipping_methods WHERE id=?",
      [id]
    );

    res.json({
      success: true,
      message: "Shipping method deleted"
    });

  } catch (error) {
    res.status(500).json({ message: "Error deleting method" });
  }
};