const mongoose = require('mongoose');

const AgreementSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TradeRequest',
            required: true
        },
        participants: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            validate: {
                validator: function validator(v) {
                    return Array.isArray(v) && v.length >= 2;
                },
                message: 'Agreement must have at least two participants'
            },
            required: true
        },
        skill: {
            type: String,
            required: [true, 'Skill is required'],
            trim: true
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 minute']
        },
        credits: {
            type: Number,
            required: [true, 'Credits are required'],
            min: [0, 'Credits cannot be negative']
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'disputed', 'cancelled'],
            default: 'active'
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

AgreementSchema.index({ participants: 1 });
AgreementSchema.index({ status: 1 });

module.exports = mongoose.model('Agreement', AgreementSchema);
