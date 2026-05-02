/**
 * Notifications Controller
 * Handles notification endpoints for career plans and other features
 */

const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Get user's unread notifications with pagination
 */
exports.listNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { limit = 20, skip = 0 } = req.query;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('_id type message relatedId read createdAt')
        .lean(),
      Notification.countDocuments({ userId: req.user._id })
    ]);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + notifications.length < total
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('[Notifications Controller] List error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notifications'
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
exports.getUnreadCount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('[Notifications Controller] Unread count error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch unread count'
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    ).select('_id type message read relatedId createdAt');

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('[Notifications Controller] Mark read error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark notification as read'
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('[Notifications Controller] Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark all as read'
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { deletedId: notification._id }
    });
  } catch (error) {
    console.error('[Notifications Controller] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete notification'
    });
  }
};
