const express = require("express");
const router = express.Router();

const { 
  getCategories,
  createCategory,
  deleteCategory
} = require("../controllers/category.controller");

// GET all categories
router.get("/", getCategories);

// CREATE category
router.post("/", createCategory);

// DELETE category
router.delete("/:id", deleteCategory);

module.exports = router;