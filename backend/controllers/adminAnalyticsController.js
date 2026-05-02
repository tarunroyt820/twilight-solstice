const User = require("../models/User");
const Agreement = require("../models/Agreement");
const TradeRequest = require("../models/TradeRequest");
const Dispute = require("../models/Dispute");

exports.getSummary = async (_req, res) => {
    try {
        const now = Date.now();
        const sevenDaysAgo = new Date(now - (7 * 24 * 60 * 60 * 1000));

        const [
            totalUsers,
            activeUsers,
            totalAgreements,
            completedAgreements,
            openDisputes,
            expiredRequests,
            avgQuality,
            avgCompletionStreak,
            achievementUsers,
            topCompletionStreakUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({
                lastActiveAt: { $gte: sevenDaysAgo }
            }),
            Agreement.countDocuments(),
            Agreement.countDocuments({ status: "completed" }),
            Dispute.countDocuments({
                status: { $in: ["open", "investigating"] }
            }),
            TradeRequest.countDocuments({
                status: "declined",
                expiresAt: { $exists: true }
            }),
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$qualityScore" }
                    }
                }
            ]),
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$completionStreak" }
                    }
                }
            ]),
            User.countDocuments({ achievements: { $exists: true, $ne: [] } }),
            User.aggregate([
                { $match: { completionStreak: { $gte: 3 } } },
                { $sort: { completionStreak: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        fullName: 1,
                        completionStreak: 1,
                        responseStreak: 1,
                        achievements: 1,
                        trustScore: 1,
                        qualityScore: 1
                    }
                }
            ])
        ]);

        const completionRate = totalAgreements > 0
            ? completedAgreements / totalAgreements
            : 0;

        const achievementPercentage = totalUsers > 0 ? achievementUsers / totalUsers : 0;

        return res.json({
            totalUsers,
            activeUsers,
            totalAgreements,
            completedAgreements,
            platformCompletionRate: completionRate,
            openDisputes,
            expiredRequests,
            averageQualityScore: Number(avgQuality?.[0]?.avg || 0),
            averageCompletionStreak: Number(avgCompletionStreak?.[0]?.avg || 0),
            achievementPercentage,
            topCompletionStreakUsers
        });
    } catch (error) {
        console.error("Admin analytics failed:", error);
        return res.status(500).json({ message: "Analytics error" });
    }
};

exports.getQualityDistribution = async (_req, res) => {
    try {
        const buckets = await User.aggregate([
            {
                $bucket: {
                    groupBy: "$qualityScore",
                    boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1],
                    default: "other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        return res.json({ success: true, buckets });
    } catch (error) {
        console.error("Quality distribution failed:", error);
        return res.status(500).json({ message: "Analytics error" });
    }
};

exports.getTrustDistribution = async (_req, res) => {
    try {
        const buckets = await User.aggregate([
            {
                $bucket: {
                    groupBy: "$trustScore",
                    boundaries: [0, 80, 100, 120, 150, 200],
                    default: "other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        return res.json({ success: true, buckets });
    } catch (error) {
        console.error("Trust distribution failed:", error);
        return res.status(500).json({ message: "Analytics error" });
    }
};

exports.getHighRiskUsers = async (_req, res) => {
    try {
        const users = await User.find({
            riskFlags: { $exists: true, $ne: [] }
        })
            .select("fullName trustScore qualityScore riskFlags")
            .sort({ qualityScore: 1, trustScore: 1 })
            .limit(25)
            .lean();

        return res.json({ success: true, users });
    } catch (error) {
        console.error("High risk users fetch failed:", error);
        return res.status(500).json({ message: "Analytics error" });
    }
};
