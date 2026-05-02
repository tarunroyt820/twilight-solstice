const express = require("express");
const router = express.Router();
const discoveryController = require("../controllers/discoveryController");
const { protect } = require("../middleware/auth");

// GET /api/discovery/search
router.get("/search", protect, discoveryController.searchProfiles);
router.get("/trending-skills", protect, discoveryController.getTrendingSkills);

module.exports = router;

