const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'marketplace_secret_key_2024';

// 1. Authenticate Token (Is the user logged in?)
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if header exists
        if (!authHeader) {
            return res.status(401).json({
                error: "Access token required. Please login."
            });
        }

        // Ensure format: Bearer TOKEN
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Invalid token format."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from DB
        const [rows] = await pool.query(
            "SELECT id, name, email, role, is_approved FROM users WHERE id = ?",
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                error: "User not found."
            });
        }

        // Attach user to request
        req.user = rows[0];

        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        return res.status(403).json({
            error: "Invalid or expired token. Please login again."
        });
    }
};

// 2. Authorize Roles (Is the user an Admin or Seller?)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// 3. Gatekeeper Check (Is the Seller approved by Admin?)
const isApprovedSeller = (req, res, next) => {
    if (req.user.role === 'seller' && req.user.is_approved !== 1) {
        return res.status(403).json({ 
            error: 'Your seller account is pending admin approval. You cannot perform this action yet.' 
        });
    }
    next();
};

module.exports = { authenticateToken, authorizeRoles, isApprovedSeller };