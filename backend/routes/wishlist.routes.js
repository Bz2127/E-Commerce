const express = require('express');
const { addToWishlist, removeFromWishlist, getWishlist, getWishlistCount, checkWishlistStatus } = require('../controllers/wishlist.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, addToWishlist);
router.delete('/:product_id', authenticateToken, removeFromWishlist);
router.get('/', authenticateToken, getWishlist);

router.get('/:product_id', authenticateToken, checkWishlistStatus);

module.exports = router;
