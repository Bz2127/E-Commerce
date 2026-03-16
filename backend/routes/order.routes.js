const express = require('express');
const {
  createOrder,
  getOrderReceipt,
  verifyPaymentCallback,
  getCustomerOrders,
  getOrderDetails,
  requestReturn,
  reorder,
  updateOrderStatus,
  getAllOrders // New controller function for Admin Dashboard
} = require('../controllers/order.controller');

const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

/* =================================
   1️⃣ ADMIN ORDER MANAGEMENT
================================= */

// Get ALL orders for Admin (Fixes the empty "User" column)
router.get('/admin/all', authenticateToken, isAdmin, getAllOrders);

// Update order status (Protected for Admin only)
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatus);


/* =================================
   2️⃣ ORDER CREATION & PAYMENT
================================= */

// Create order & start Chapa payment
router.post('/create', authenticateToken, createOrder);

// Chapa redirects here after payment
router.get('/receipt/:tx_ref', getOrderReceipt);

// Chapa server verification callback
router.get('/verify-payment/:tx_ref', verifyPaymentCallback);


/* =================================
   3️⃣ CUSTOMER ORDER MANAGEMENT
================================= */

// Get logged-in customer orders
router.get('/my-orders', authenticateToken, getCustomerOrders);

// Get specific order details
router.get('/:id', authenticateToken, getOrderDetails);

// Request return for delivered order
router.post('/:id/return', authenticateToken, requestReturn);

// Reorder previous order
router.post('/:id/reorder', authenticateToken, reorder);

module.exports = router;