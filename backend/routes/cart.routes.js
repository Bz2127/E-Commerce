const express = require('express');
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cart.controller');

const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ===============================
   AUTHENTICATION MIDDLEWARE
================================ */
router.use(authenticateToken);


/* ===============================
   CART ROUTES
================================ */

// Get all cart items
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);
//
router.post('/sync', syncCart);
// Update cart quantity
router.put('/update', updateCartQuantity);

// Remove single item from cart
router.delete('/remove/:variant_id', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);


module.exports = router;