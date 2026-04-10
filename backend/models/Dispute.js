const mongoose = require('mongoose');

const ResolutionSchema = new mongoose.Schema(
    {
        outcome: {
            type: String,
            default: '',
            trim: true
        },
        compensationCredits: {
            type: Number,
            default: 0
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    { _id: false }
);

const DisputeSchema = new mongoose.Schema(
    {
        agreementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            required: true
        },
        filedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reason: {
            type: String,
            enum: ['noshow', 'quality', 'other'],
            required: [true, 'Dispute reason is required']
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [3000, 'Description cannot exceed 3000 characters']
        },
        evidence: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['open', 'investigating', 'resolved'],
            default: 'open'
        },
        resolution: {
            type: ResolutionSchema,
            default: null
        }
    },
    { timestamps: true }
);

DisputeSchema.index({ status: 1 });
DisputeSchema.index(
    { agreementId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ['open', 'investigating'] } }
    }
);

module.exports = mongoose.model('Dispute', DisputeSchema);
