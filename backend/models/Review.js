const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        agreementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement',
            required: true
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        revieweeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        comment: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1500, 'Comment cannot exceed 1500 characters']
        }
    },
    { timestamps: true }
);

ReviewSchema.index({ agreementId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
