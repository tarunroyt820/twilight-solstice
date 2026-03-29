const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/overview', protect, dashboardController.getOverview);

module.exports = router;
