/**
 * PushSubscription Model
 * Stores user push notification subscriptions
 */

const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    subscription: {
      endpoint: {
        type: String,
        required: true,
      },
      keys: {
        p256dh: String,
        auth: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userAgent: String,
    lastDelivered: Date,
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for finding active subscriptions
PushSubscriptionSchema.index({ userId: 1, isActive: 1 });
PushSubscriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
