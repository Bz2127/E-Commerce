const express = require('express');
const router = express.Router();

const { 
    getPendingSellers, 
    approveSeller, 
    getAllUsers, 
    updateUserStatus, 
    getDashboardStats,
    getRevenueAnalytics,
    getOrderAnalytics,
    getTopProducts,
    getAllOrders,
    updateOrderStatus,
    rejectSeller,
    getAllSellers,
    getAllTransactions

} = require('../controllers/admin.controller');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const productController = require('../controllers/product.controller');
const { getPendingProducts, approveProduct, rejectProduct } = require('../controllers/admin.controller');

// ===============================
// PROTECT ADMIN ROUTES
// ===============================
router.use(authenticateToken);
router.use(authorizeRoles('admin'));
router.get('/transactions', getAllTransactions);
// ===============================
// ADMIN MANAGEMENT
// ===============================
router.get('/sellers/pending', getPendingSellers);
router.patch('/sellers/:id/approve', approveSeller);
router.patch('/sellers/:id/reject', rejectSeller);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);



// ===============================
// DASHBOARD
// ===============================
router.get('/dashboard', getDashboardStats);

//PRODUCT MODERATION

router.get('/products/pending', getPendingProducts);
router.patch('/products/:id/approve', productController.approveProduct);
router.patch('/products/:id/reject', productController.rejectProduct);
// ===============================
// ANALYTICS
// ===============================
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/top-products', getTopProducts);
// Order management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
//
router.get('/sellers', getAllSellers);


module.exports = router;