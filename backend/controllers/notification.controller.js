const { pool } = require('../config/db');

// =====================================
// CREATE NOTIFICATION
// =====================================
const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;

        // Corrected: use 'pool' instead of 'db'
        const [result] = await pool.execute(
            `INSERT INTO notifications (user_id, title, message, type)
             VALUES (?, ?, ?, ?)`,
            [user_id, title, message, type]
        );

        res.json({
            success: true,
            message: "Notification created",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create Notification Error:", error.message);
        res.status(500).json({ message: "Error creating notification" });
    }
};

// =====================================
// GET USER NOTIFICATIONS
// =====================================
const getUserNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Corrected: use 'pool' instead of 'db'
        const [rows] = await pool.execute(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [user_id]
        );

        res.json(rows);
    } catch (error) {
        console.error("Fetch Notifications Error:", error.message);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// =====================================
// MARK AS READ
// =====================================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // Corrected: use 'pool' instead of 'db'
        await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.error("Mark Read Error:", error.message);
        res.status(500).json({ message: "Error updating notification" });
    }
};

// =====================================
// MARK ALL AS READ
// =====================================
const markAllAsRead = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Corrected: use 'pool' instead of 'db'
        await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = ?`,
            [user_id]
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Mark All Read Error:", error.message);
        res.status(500).json({ message: "Error updating notifications" });
    }
};

// =====================================
// DELETE NOTIFICATION
// =====================================
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

       
        await pool.execute(
            "DELETE FROM notifications WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ message: "Error deleting notification" });
    }
};


module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};