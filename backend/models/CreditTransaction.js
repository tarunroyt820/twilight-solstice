const mongoose = require('mongoose');

const CreditTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required']
        },
        balance: {
            type: Number,
            required: [true, 'Balance is required']
        },
        type: {
            type: String,
            enum: ['initial', 'earned', 'spent', 'penalty', 'compensation'],
            required: [true, 'Transaction type is required']
        },
        relatedAgreement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            default: null
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        }
    },
    { timestamps: true }
);

CreditTransactionSchema.index({ userId: 1 });
CreditTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', CreditTransactionSchema);
