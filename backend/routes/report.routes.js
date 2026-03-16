const express = require('express');
const router = express.Router();

const {
    getDashboardSummary,
    getTopSellers,
    getDailySales,
    getProductPerformance,
    getSellerPerformance,
     getSalesReport
} = require('../controllers/report.controller');

router.get('/dashboard', getDashboardSummary);
router.get('/top-sellers', getTopSellers);
router.get('/sales', getDailySales);
router.get('/product-performance', getProductPerformance);
router.get('/seller-performance', getSellerPerformance);

module.exports = router;