const express = require("express");
const { protect } = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const controller = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get("/summary", protect, adminMiddleware, controller.getSummary);
router.get("/quality-distribution", protect, adminMiddleware, controller.getQualityDistribution);
router.get("/trust-distribution", protect, adminMiddleware, controller.getTrustDistribution);
router.get("/high-risk-users", protect, adminMiddleware, controller.getHighRiskUsers);

module.exports = router;
