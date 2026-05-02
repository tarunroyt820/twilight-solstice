const User = require("../models/User");
const Agreement = require("../models/Agreement");
const TradeRequest = require("../models/TradeRequest");
const Dispute = require("../models/Dispute");
const Session = require("../models/Session");

const runQualityScoreJob = async () => {
    try {
        const users = await User.find({}).select("_id trustScore lastActiveAt achievements completionStreak responseStreak lastCompletionDate");

        for (const user of users) {
            const userId = user._id;

            const [
                totalAgreements,
                completedAgreements,
                totalReceived,
                responded,
                userAgreements,
                noShows
            ] = await Promise.all([
                Agreement.countDocuments({ participants: userId }),
                Agreement.countDocuments({ participants: userId, status: "completed" }),
                TradeRequest.countDocuments({ to: userId }),
                TradeRequest.countDocuments({
                    to: userId,
                    status: { $in: ["accepted", "declined"] }
                }),
                Agreement.find({ participants: userId }).select("_id").lean(),
                Session.countDocuments({ "noShowReported.by": userId })
            ]);

            const completionRate = totalAgreements > 0 ? completedAgreements / totalAgreements : 0;
            const responseRate = totalReceived > 0 ? responded / totalReceived : 1;

            let activityScore = 0.2;
            let trustAdjusted = Number(user.trustScore || 0);
            if (user.lastActiveAt) {
                const daysSinceActive =
                    (Date.now() - new Date(user.lastActiveAt).getTime()) /
                    (1000 * 60 * 60 * 24);

                if (daysSinceActive <= 7) activityScore = 1;
                else if (daysSinceActive <= 30) activityScore = 0.5;

                if (daysSinceActive > 30) {
                    const decayFactor = Math.min((daysSinceActive - 30) * 0.5, 20);
                    trustAdjusted = Math.max(trustAdjusted - decayFactor, 50);
                }
            }

            const userAgreementIds = Array.isArray(userAgreements) ? userAgreements.map((agreement) => agreement._id) : [];
            const totalDisputes = userAgreementIds.length > 0
                ? await Dispute.countDocuments({ agreementId: { $in: userAgreementIds } })
                : 0;

            const disputePenalty = Math.min(totalDisputes * 0.05, 0.3);
            const noShowPenalty = Math.min(noShows * 0.05, 0.25);

            const achievements = Array.isArray(user.achievements) ? [...new Set(user.achievements)] : [];
            const riskFlags = [];
            if (totalAgreements >= 10 && completionRate < 0.4) {
                riskFlags.push("Low Completion Pattern");
            }

            if (totalReceived >= 10 && responseRate < 0.3) {
                riskFlags.push("Low Response Pattern");
            }

            if (noShows >= 3) {
                riskFlags.push("Repeated No-Show");
            }

            if (totalDisputes >= 3) {
                riskFlags.push("High Dispute Pattern");
            }

            if (completedAgreements === 5) {
                achievements.push("5 Exchanges Completed");
            }

            if (completedAgreements === 10) {
                achievements.push("10 Exchanges Completed");
            }

            if (completionRate >= 0.9 && completedAgreements >= 10) {
                achievements.push("Reliable Mentor");
            }

            if (Number(user.completionStreak || 0) >= 5) {
                achievements.push("5-Day Completion Streak");
            }

            if (Number(user.responseStreak || 0) >= 3) {
                achievements.push("Fast Responder");
            }

            if (Number(user.responseStreak || 0) >= 7) {
                achievements.push("7-Day Response Streak");
            }

            const normalizedAchievements = [...new Set(achievements)];

            const trustNormalized = trustAdjusted / 100;
            const baseScore =
                0.4 * completionRate +
                0.2 * responseRate +
                0.2 * trustNormalized +
                0.2 * activityScore;

            const qualityScore =
                baseScore * (1 - disputePenalty) * (1 - noShowPenalty);

            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        completionRate,
                        responseRate,
                        activityScore,
                        qualityScore,
                        riskFlags,
                        achievements: normalizedAchievements
                    }
                }
            );
        }
    } catch (error) {
        console.error("QualityScore job failed:", error);
    }
};

module.exports = { runQualityScoreJob };
