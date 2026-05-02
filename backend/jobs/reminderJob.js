const Session = require('../models/Session');
const Agreement = require('../models/Agreement');
const { postSystemMessage } = require('../services/systemMessageService');

const runReminderJob = async () => {
    try {
        const now = new Date();

        // 24-hour reminder window (23-24h before session)
        const in24hStart = new Date(now.getTime() + (23 * 60 * 60 * 1000));
        const in24hEnd = new Date(now.getTime() + (24 * 60 * 60 * 1000));

        const session24Candidates = await Session.find({
            status: 'scheduled',
            reminder24Sent: false,
            scheduledAt: { $gte: in24hStart, $lte: in24hEnd }
        }).select('_id agreementId scheduledAt');

        for (const candidate of session24Candidates) {
            const claimed = await Session.findOneAndUpdate(
                {
                    _id: candidate._id,
                    status: 'scheduled',
                    reminder24Sent: false,
                    scheduledAt: { $gte: in24hStart, $lte: in24hEnd }
                },
                { $set: { reminder24Sent: true } },
                { new: true }
            ).select('agreementId');

            if (!claimed) continue;

            await postSystemMessage(
                claimed.agreementId,
                'Reminder: You have a session in 24 hours.'
            );
        }

        // 1-hour reminder window (59-60min before session)
        const in1hStart = new Date(now.getTime() + (59 * 60 * 1000));
        const in1hEnd = new Date(now.getTime() + (60 * 60 * 1000));

        const session1Candidates = await Session.find({
            status: 'scheduled',
            reminder1Sent: false,
            scheduledAt: { $gte: in1hStart, $lte: in1hEnd }
        }).select('_id agreementId scheduledAt');

        for (const candidate of session1Candidates) {
            const claimed = await Session.findOneAndUpdate(
                {
                    _id: candidate._id,
                    status: 'scheduled',
                    reminder1Sent: false,
                    scheduledAt: { $gte: in1hStart, $lte: in1hEnd }
                },
                { $set: { reminder1Sent: true } },
                { new: true }
            ).select('agreementId');

            if (!claimed) continue;

            await postSystemMessage(
                claimed.agreementId,
                'Reminder: Your session starts in 1 hour.'
            );
        }

        // Review reminder (24h after agreement completion)
        const reviewReminderTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const agreementCandidates = await Agreement.find({
            status: 'completed',
            reviewReminderSent: false,
            completedAt: { $exists: true, $ne: null, $lte: reviewReminderTime }
        }).select('_id completedAt');

        for (const candidate of agreementCandidates) {
            const claimed = await Agreement.findOneAndUpdate(
                {
                    _id: candidate._id,
                    status: 'completed',
                    reviewReminderSent: false,
                    completedAt: { $exists: true, $ne: null, $lte: reviewReminderTime }
                },
                { $set: { reviewReminderSent: true } },
                { new: true }
            ).select('_id');

            if (!claimed) continue;

            await postSystemMessage(
                claimed._id,
                'Please leave a review for your completed exchange.'
            );
        }
    } catch (error) {
        console.error('Reminder job failed:', error);
        // Never throw - reminders should not break core flow.
    }
};

module.exports = { runReminderJob };
