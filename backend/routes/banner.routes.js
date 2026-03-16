const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");

router.get("/", bannerController.getBanners);
router.post("/", bannerController.createBanner);
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;