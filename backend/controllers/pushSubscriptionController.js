/**
 * Push Subscription Controller
 * Handles subscription management for push notifications
 */

const PushSubscription = require('../models/PushSubscription');

/**
 * POST /api/push-subscriptions/subscribe
 * Subscribe a user to push notifications
 */
exports.subscribe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription object',
      });
    }

    // Update or create subscription
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        subscription,
        isActive: true,
        userAgent: req.headers['user-agent'],
        failureCount: 0,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: pushSubscription._id,
        isActive: pushSubscription.isActive,
      },
    });
  } catch (error) {
    console.error('[Push Subscription Controller] Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to subscribe',
    });
  }
};

/**
 * POST /api/push-subscriptions/unsubscribe
 * Unsubscribe a user from push notifications
 */
exports.unsubscribe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    await PushSubscription.findOneAndUpdate(
      { userId: req.user._id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      data: { unsubscribed: true },
    });
  } catch (error) {
    console.error('[Push Subscription Controller] Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to unsubscribe',
    });
  }
};

/**
 * GET /api/push-subscriptions/status
 * Get subscription status
 */
exports.getStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const subscription = await PushSubscription.findOne(
      { userId: req.user._id },
      'isActive createdAt'
    ).lean();

    res.status(200).json({
      success: true,
      data: {
        isSubscribed: !!subscription?.isActive,
        createdAt: subscription?.createdAt,
      },
    });
  } catch (error) {
    console.error('[Push Subscription Controller] Get status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get status',
    });
  }
};
