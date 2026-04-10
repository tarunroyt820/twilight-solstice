let cron;
try {
    cron = require('node-cron');
} catch (error) {
    cron = null;
}

const Session = require('../models/Session');
const Agreement = require('../models/Agreement');
const { sendNotification } = require('../utils/notificationHelper');

const buildWindow = (nowInput) => {
    const now = nowInput ? new Date(nowInput) : new Date();
    const next24h = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    return { now, next24h };
};

const runSessionReminderCheck = async (deps = {}) => {
    const SessionModel = deps.SessionModel || Session;
    const AgreementModel = deps.AgreementModel || Agreement;
    const sendNotificationFn = deps.sendNotificationFn || sendNotification;
    const { now, next24h } = buildWindow(deps.now);

    const sessions = await SessionModel.find({
        status: 'scheduled',
        scheduledAt: { $gte: now, $lte: next24h }
    }).select('agreementId scheduledAt');

    let notificationsSent = 0;

    for (const session of sessions) {
        const agreement = await AgreementModel.findById(session.agreementId).select('participants');
        if (!agreement || !Array.isArray(agreement.participants)) continue;

        for (const participantId of agreement.participants) {
            await sendNotificationFn(participantId, 'session_reminder', {
                relatedId: session._id,
                message: `Reminder: your session is scheduled at ${new Date(session.scheduledAt).toISOString()}`
            });
            notificationsSent += 1;
        }
    }

    return {
        checkedAt: now.toISOString(),
        sessionCount: sessions.length,
        notificationsSent
    };
};

const setupSessionReminderCron = () => {
    if (!cron) {
        console.warn('[session-reminder] node-cron not installed; cron scheduler is disabled');
        return null;
    }

    // Daily at 08:00 server time.
    return cron.schedule('0 8 * * *', async () => {
        try {
            const summary = await runSessionReminderCheck();
            if (summary.notificationsSent > 0) {
                console.log(`[session-reminder] Sent ${summary.notificationsSent} reminder notification(s)`);
            }
        } catch (error) {
            console.error(`[session-reminder] Failed reminder job: ${error.message}`);
        }
    });
};

module.exports = {
    runSessionReminderCheck,
    setupSessionReminderCron
};
