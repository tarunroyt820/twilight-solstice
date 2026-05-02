const SkillProfile = require("../models/SkillProfile");
const User = require("../models/User");
const matchingService = require("../services/matchingService");

const toSafeNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const hasId = (list, id) => {
    if (!Array.isArray(list) || !id) return false;
    const target = String(id);
    return list.some((entry) => String(entry) === target);
};

exports.searchProfiles = async (req, res) => {
    try {
        const {
            personName,
            skillOffered,
            skillWanted,
            category,
            minTrustScore,
            maxHourlyRate,
            availabilityOverlap,
            availableThisWeek,
            page = 1,
            limit = 10,
            sortBy = "match"
        } = req.query;

        const currentUserId = req.user.id;

        const numericPage = Math.max(parseInt(page, 10) || 1, 1);
        const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const skip = (numericPage - 1) * numericLimit;

        const query = {
            userId: { $ne: currentUserId },
            isActive: true
        };

        if (skillOffered) {
            query["skillsOffered.name"] = {
                $regex: String(skillOffered),
                $options: "i"
            };
        }

        if (skillWanted) {
            query["skillsWanted.name"] = {
                $regex: String(skillWanted),
                $options: "i"
            };
        }

        if (category) {
            query["skillsOffered.category"] = String(category);
        }

        if (maxHourlyRate !== undefined && maxHourlyRate !== "") {
            query.hourlyRate = { $lte: toSafeNumber(maxHourlyRate, 0) };
        }

        const totalResults = await SkillProfile.countDocuments(query);

        let profiles = await SkillProfile.find(query)
            .populate("userId", "fullName trustScore activeExchangeCount blockedUsers lastActiveAt qualityScore completionRate responseRate activityScore riskFlags achievements completionStreak responseStreak")
            .skip(skip)
            .limit(numericLimit)
            .lean();

        const currentUser = await User.findById(currentUserId).select("blockedUsers").lean();
        const currentBlocked = currentUser?.blockedUsers || [];

        profiles = profiles.filter((profile) => {
            const otherUser = profile.userId;
            if (!otherUser || !otherUser._id) return false;

            const blockedByCurrent = hasId(currentBlocked, otherUser._id);
            const blockedByOther = hasId(otherUser.blockedUsers, currentUserId);
            return !blockedByCurrent && !blockedByOther;
        });

        if (personName && String(personName).trim()) {
            const needle = String(personName).trim().toLowerCase();
            profiles = profiles.filter((profile) =>
                String(profile?.userId?.fullName || "").toLowerCase().includes(needle)
            );
        }

        if (minTrustScore !== undefined && minTrustScore !== "") {
            const minimum = toSafeNumber(minTrustScore, 0);
            profiles = profiles.filter((profile) => Number(profile?.userId?.trustScore || 0) >= minimum);
        }

        if (availabilityOverlap === "true" || availableThisWeek === "true") {
            profiles = await matchingService.filterByAvailabilityOverlap(currentUserId, profiles);
        }

        profiles = await Promise.all(
            profiles.map(async (profile) => {
                try {
                    const match = await matchingService.computeMatchScore(currentUserId, profile.userId._id);
                    return {
                        ...profile,
                        matchScore: match?.score || 0,
                        matchReasons: match?.reasons || [],
                        availabilityOverlap: Number(match?.availabilityScore || 0)
                    };
                } catch (_err) {
                    return {
                        ...profile,
                        matchScore: 0,
                        matchReasons: [],
                        availabilityOverlap: 0
                    };
                }
            })
        );

        if (availableThisWeek === "true") {
            profiles = profiles.filter((profile) => Number(profile?.availabilityOverlap || 0) > 0);
        }

        profiles = profiles.map((profile) => {
            const completionRate = Number(profile?.userId?.completionRate ?? 0);
            const responseRate = Number(profile?.userId?.responseRate ?? 1);
            const activityScore = Number(profile?.userId?.activityScore ?? 0.2);
            const quality = Number(profile?.userId?.qualityScore ?? 0);
            const achievements = Array.isArray(profile?.userId?.achievements) ? profile.userId.achievements : [];
            const completionStreak = Number(profile?.userId?.completionStreak || 0);

            let daysSinceActive = Number.POSITIVE_INFINITY;
            const lastActiveRaw = profile?.userId?.lastActiveAt;
            if (lastActiveRaw) {
                const lastActive = new Date(lastActiveRaw);
                if (!Number.isNaN(lastActive.getTime())) {
                    daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
                }
            }

            const reliabilityBadges = [];

            if (completionRate >= 0.8) {
                reliabilityBadges.push("High Completion");
            }

            if (responseRate >= 0.8) {
                reliabilityBadges.push("Fast Responder");
            }

            if (Number(profile?.userId?.trustScore || 0) >= 120) {
                reliabilityBadges.push("Trusted");
            }

            if (daysSinceActive <= 7) {
                reliabilityBadges.push("Active Recently");
            }

            const baseScore =
                0.6 * Number(profile?.matchScore || 0) +
                0.4 * quality;

            const riskFlags = Array.isArray(profile?.userId?.riskFlags) ? profile.userId.riskFlags : [];
            let achievementBoost = 0;

            if (achievements.includes("Reliable Mentor")) {
                achievementBoost += 0.05;
            }

            if (completionStreak >= 5) {
                achievementBoost += 0.05;
            }

            let adjustedScore = baseScore * (1 + achievementBoost);

            if (riskFlags.includes("Repeated No-Show")) {
                adjustedScore *= 0.7;
            }

            return {
                ...profile,
                completionRate,
                responseRate,
                activityScore,
                reliabilityBadges,
                achievements,
                completionStreak,
                smartScore: adjustedScore
            };
        });

        if (sortBy === "trust") {
            profiles.sort((a, b) => Number(b?.userId?.trustScore || 0) - Number(a?.userId?.trustScore || 0));
        } else if (sortBy === "rate") {
            profiles.sort((a, b) => Number(a?.hourlyRate || 0) - Number(b?.hourlyRate || 0));
        } else {
            profiles.sort((a, b) => Number(b?.smartScore || 0) - Number(a?.smartScore || 0));
        }

        return res.json({
            success: true,
            page: numericPage,
            totalPages: Math.ceil(totalResults / numericLimit),
            totalResults,
            results: profiles
        });
    } catch (error) {
        console.error("Discovery search error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search profiles"
        });
    }
};

exports.getTrendingSkills = async (_req, res) => {
    try {
        const trending = await SkillProfile.aggregate([
            { $unwind: "$skillsOffered" },
            {
                $group: {
                    _id: "$skillsOffered.name",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return res.json({ success: true, trending });
    } catch (error) {
        console.error("Trending skills error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch trending skills"
        });
    }
};

