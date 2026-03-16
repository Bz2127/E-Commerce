const express = require("express");
const {
  getAllProducts,
  getProductDetails,
  getSellerProducts,
  addProduct,
  editProduct,
  deleteProduct,
  searchProducts,
  getProductRatings,
  addReview,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getFlashSales,
  getPendingProducts,
  approveProduct,
  rejectProduct
} = require("../controllers/product.controller");

// Corrected imports to match your auth.js middleware file
const { authenticateToken, authorizeRoles, isApprovedSeller } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();


//
router.get('/admin/pending', authenticateToken, authorizeRoles('admin'), getPendingProducts);

router.patch('/admin/:id/approve', authenticateToken, authorizeRoles('admin'), approveProduct);

router.patch('/admin/:id/reject', authenticateToken, authorizeRoles('admin'), rejectProduct);
// ===================================
// 1️⃣ HOME PAGE PRODUCT SECTIONS (Public)
// ===================================
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/flash-sales", getFlashSales);

// ===================================
// 2️⃣ PRODUCT SEARCH & BROWSING (Public)
// ===================================
router.get("/search/query", searchProducts);
router.get("/all", getAllProducts);
router.get("/:id/ratings", getProductRatings);
router.get("/details/:id", getProductDetails);
router.get("/", getAllProducts);

// ===================================
// 3️⃣ SELLER PRODUCT MANAGEMENT (Protected)
// ===================================

// GET SELLER'S OWN PRODUCTS
router.get(
  "/my-products",
  authenticateToken,
  authorizeRoles("seller"),
  getSellerProducts
);

// ADD NEW PRODUCT
// Integrated isApprovedSeller Gatekeeper
router.post(
  "/",
  authenticateToken,
  authorizeRoles("seller"),
  isApprovedSeller, 
  upload.array("images", 5), 
  addProduct
);

// EDIT PRODUCT
// Integrated isApprovedSeller Gatekeeper
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("seller"),
  isApprovedSeller,
  upload.array("images", 5),
  editProduct
);

// DELETE PRODUCT
// Integrated isApprovedSeller Gatekeeper
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("seller"),
  isApprovedSeller,
  deleteProduct
);

// ===================================
// 4️⃣ CUSTOMER REVIEWS (Protected)
// ===================================
router.post(
  "/:id/review",
  authenticateToken,
  addReview
);

exports.approveProduct = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE products SET status='approved' WHERE id=?",
      [id]
    );

    res.json({ message: "Product approved" });

  } catch (error) {
    res.status(500).json({ error: "Failed to approve product" });
  }
};

exports.rejectProduct = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "UPDATE products SET status='rejected' WHERE id=?",
      [id]
    );

    res.json({ message: "Product rejected" });

  } catch (error) {
    res.status(500).json({ error: "Failed to reject product" });
  }
};
module.exports = router;