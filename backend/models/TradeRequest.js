const mongoose = require('mongoose');

const CounterOfferSchema = new mongoose.Schema(
    {
        credits: {
            type: Number,
            min: [0, 'Counter-offer credits cannot be negative']
        },
        duration: {
            type: Number,
            min: [1, 'Counter-offer duration must be at least 1 minute']
        },
        message: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { _id: false }
);

const TradeRequestSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        offeredSkill: {
            type: String,
            required: [true, 'Offered skill is required'],
            trim: true
        },
        requestedSkill: {
            type: String,
            required: [true, 'Requested skill is required'],
            trim: true
        },
        proposedCredits: {
            type: Number,
            required: [true, 'Proposed credits are required'],
            min: [0, 'Proposed credits cannot be negative']
        },
        proposedDuration: {
            type: Number,
            required: [true, 'Proposed duration is required'],
            min: [1, 'Proposed duration must be at least 1 minute']
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'countered', 'expired'],
            default: 'pending'
        },
        counterOffer: {
            type: CounterOfferSchema,
            default: null
        },
        expiresAt: {
            type: Date,
            default: function defaultExpiry() {
                return new Date(Date.now() + (48 * 60 * 60 * 1000));
            }
        }
    },
    { timestamps: true }
);

TradeRequestSchema.index({ from: 1 });
TradeRequestSchema.index({ to: 1 });
TradeRequestSchema.index({ status: 1 });
TradeRequestSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('TradeRequest', TradeRequestSchema);
