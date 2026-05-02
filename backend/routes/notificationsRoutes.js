const express = require('express');
const { protect } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

router.get('/', protect, notificationsController.listNotifications);
router.get('/unread-count', protect, notificationsController.getUnreadCount);
router.patch('/read-all', protect, notificationsController.markAllNotificationsRead);
router.patch('/:id/read', protect, notificationsController.markNotificationRead);
router.delete('/:id', protect, notificationsController.deleteNotification);

module.exports = router;
