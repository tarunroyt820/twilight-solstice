const TradeRequest = require("../models/TradeRequest");

const expireOldRequests = async () => {
    const now = new Date();

    const result = await TradeRequest.updateMany(
        {
            status: "pending",
            expiresAt: { $lte: now }
        },
        {
            $set: { status: "expired" }
        }
    );

    return {
        checkedAt: now.toISOString(),
        expiredCount: Number(result.modifiedCount || 0)
    };
};

module.exports = { expireOldRequests };
