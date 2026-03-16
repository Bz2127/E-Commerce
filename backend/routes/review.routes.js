const express = require('express');
const { addReview, getProductReviews, reportReview, getCustomerReviews } = require('../controllers/review.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, addReview);
router.get('/product/:product_id', getProductReviews);
router.get('/my-reviews', authenticateToken, getCustomerReviews);
router.post('/report', authenticateToken, reportReview);

module.exports = router;
