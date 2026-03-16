const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// 1. Import Controllers (Exactly as provided)
const { 
    getSellerStats, 
    getSellerOrders, 
    updateOrderStatus, 
    requestPayout,
    addProduct,
    editProduct,
    deleteProduct,
    createPromotion,
    getInventory 
} = require('../controllers/seller.controller');

// 2. Import Middleware (Fixed naming to match your auth.js)
// We use 'authorizeRoles' because that is what you exported in auth.js
const { 
    authenticateToken, 
    authorizeRoles, 
    isApprovedSeller 
} = require('../middleware/auth'); 

// ==========================================
// APPLY AUTHENTICATION & SELLER ROLE
// ==========================================
// These apply to ALL routes below them
router.use(authenticateToken);           // Verify JWT ✅
router.use(authorizeRoles('seller'));    // Ensure user is a seller ✅
router.use(isApprovedSeller);            // Ensure seller is approved by admin ✅

// ==========================================
// DASHBOARD ROUTES
// ==========================================
router.get('/stats', getSellerStats);        // Seller dashboard stats ✅
router.get('/orders', getSellerOrders);      // Seller order list ✅
router.put('/orders/status/:id', updateOrderStatus); // Update order status ✅
router.post('/payout', requestPayout);       // Request payout ✅

// ==========================================
// PRODUCT & INVENTORY MANAGEMENT
// ==========================================
router.get('/inventory', getInventory);      // View inventory ✅

// Add new product (WITH IMAGE UPLOAD)
router.post('/products', upload.array('images',5), addProduct);       

// Edit existing product (OPTIONAL IMAGE UPDATE)
router.put('/products/:id', upload.single('image'), editProduct);    

router.delete('/products/:id', deleteProduct); // Delete product ✅

// ==========================================
// PROMOTIONS ROUTES
// ==========================================
router.post('/promotions', createPromotion); // Create discount / promotion ✅

module.exports = router;