const User = require('../models/User');
const Review = require('../models/Review');
const Agreement = require('../models/Agreement');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const resolveSelected = async (queryOrPromise, fields) => {
    const resolved = await queryOrPromise;
    if (resolved && typeof resolved.select === 'function') {
        return resolved.select(fields);
    }
    return resolved;
};

const computeTrustScoreFromMetrics = ({ reviewAverage = 0, reviewCount = 0, noShowCount = 0, completionCount = 0 }) => {
    let score = 100;

    if (reviewCount > 0) {
        // Average 3.0 is neutral; every point above/below moves trust.
        score += (reviewAverage - 3) * 8;
    }

    score -= noShowCount * 15;
    score += Math.min(10, completionCount * 2);

    return Math.round(clamp(score, 0, 100));
};

const updateTrustScoreWithDeps = async (deps, userId) => {
    const { UserModel, ReviewModel, AgreementModel } = deps;
    const [user, reviews, completionCount] = await Promise.all([
        resolveSelected(UserModel.findById(userId), 'trustScore noShowCount'),
        resolveSelected(ReviewModel.find({ revieweeId: userId }), 'rating'),
        AgreementModel.countDocuments({ participants: userId, status: 'completed' })
    ]);

    if (!user) {
        throw new Error('User not found');
    }

    const reviewCount = reviews.length;
    const reviewAverage = reviewCount
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : 0;

    const nextTrustScore = computeTrustScoreFromMetrics({
        reviewAverage,
        reviewCount,
        noShowCount: Number(user.noShowCount || 0),
        completionCount
    });

    user.trustScore = nextTrustScore;
    await user.save();

    return {
        userId: user._id,
        trustScore: nextTrustScore,
        metrics: {
            reviewAverage,
            reviewCount,
            noShowCount: Number(user.noShowCount || 0),
            completionCount
        }
    };
};

const updateTrustScore = async (userId) => {
    return updateTrustScoreWithDeps(
        { UserModel: User, ReviewModel: Review, AgreementModel: Agreement },
        userId
    );
};

module.exports = {
    computeTrustScoreFromMetrics,
    updateTrustScoreWithDeps,
    updateTrustScore
};
