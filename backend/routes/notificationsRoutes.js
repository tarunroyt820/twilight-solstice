const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.get('/', protect, exchangeController.listNotifications);
router.patch('/read-all', protect, exchangeController.markAllNotificationsRead);
router.patch('/:id/read', protect, exchangeController.markNotificationRead);

module.exports = router;
