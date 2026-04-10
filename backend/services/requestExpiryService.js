let cron;
try {
    cron = require('node-cron');
} catch (error) {
    cron = null;
}
const TradeRequest = require('../models/TradeRequest');

const checkRequestExpiryWithModel = async (TradeRequestModel) => {
    const now = new Date();
    const result = await TradeRequestModel.updateMany(
        {
            status: 'pending',
            expiresAt: { $lte: now }
        },
        {
            $set: { status: 'expired' }
        }
    );

    return {
        checkedAt: now.toISOString(),
        expiredCount: Number(result.modifiedCount || 0)
    };
};

const checkRequestExpiry = async () => checkRequestExpiryWithModel(TradeRequest);

const setupRequestExpiryCron = () => {
    if (!cron) {
        console.warn('[request-expiry] node-cron not installed; cron scheduler is disabled');
        return null;
    }

    // Run at minute 0 of every hour.
    return cron.schedule('0 * * * *', async () => {
        try {
            const summary = await checkRequestExpiry();
            if (summary.expiredCount > 0) {
                console.log(`[request-expiry] Marked ${summary.expiredCount} trade request(s) as expired`);
            }
        } catch (error) {
            console.error(`[request-expiry] Failed to check expiry: ${error.message}`);
        }
    });
};

module.exports = {
    checkRequestExpiryWithModel,
    checkRequestExpiry,
    setupRequestExpiryCron
};
