/**
 * Push Subscription Routes
 * Endpoints for managing push notification subscriptions
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const pushSubscriptionController = require('../controllers/pushSubscriptionController');

const router = express.Router();

router.post('/subscribe', protect, pushSubscriptionController.subscribe);
router.post('/unsubscribe', protect, pushSubscriptionController.unsubscribe);
router.get('/status', protect, pushSubscriptionController.getStatus);

module.exports = router;
