const mongoose = require('mongoose');

const ConfirmationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        confirmedAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    { _id: false }
);

const NoShowSchema = new mongoose.Schema(
    {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        at: {
            type: Date
        },
        reason: {
            type: String,
            default: '',
            trim: true
        },
        proof: {
            type: String,
            default: '',
            trim: true
        }
    },
    { _id: false }
);

const SessionSchema = new mongoose.Schema(
    {
        agreementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            required: true
        },
        scheduledAt: {
            type: Date,
            required: [true, 'scheduledAt is required']
        },
        completedAt: {
            type: Date,
            default: null
        },
        participantConfirmations: {
            type: [ConfirmationSchema],
            default: []
        },
        noShowReported: {
            type: NoShowSchema,
            default: null
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'disputed', 'noshow'],
            default: 'scheduled'
        }
    },
    { timestamps: true }
);

SessionSchema.index({ agreementId: 1 });
SessionSchema.index({ scheduledAt: 1 });
SessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', SessionSchema);
