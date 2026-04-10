const assert = require('assert');
const { sendNotification, sendNotificationToMany } = require('../utils/notificationHelper');
const { runSessionReminderCheck } = require('../jobs/sessionReminder');

async function testNotificationHelper() {
    const inserted = [];
    const NotificationModel = {
        create: async (payload) => {
            inserted.push(payload);
            return payload;
        }
    };

    await sendNotification('user-1', 'request_received', { relatedId: 'req-1' }, { NotificationModel });
    await sendNotificationToMany(['user-1', 'user-2', 'user-2'], 'exchange_completed', { relatedId: 'agr-1' }, { NotificationModel });

    assert.strictEqual(inserted.length, 3, 'Expected helper to create notifications for single + deduped many');
    assert.strictEqual(inserted[0].type, 'request_received');
    assert.strictEqual(inserted[1].type, 'exchange_completed');
}

async function testSessionReminderJob() {
    const notificationCalls = [];
    const SessionModel = {
        find: () => ({
            select: async () => ([
                {
                    _id: 'sess-1',
                    agreementId: 'agr-1',
                    scheduledAt: new Date(Date.now() + (2 * 60 * 60 * 1000))
                }
            ])
        })
    };

    const AgreementModel = {
        findById: () => ({
            select: async () => ({
                participants: ['user-1', 'user-2']
            })
        })
    };

    const summary = await runSessionReminderCheck({
        SessionModel,
        AgreementModel,
        sendNotificationFn: async (userId, type, data) => {
            notificationCalls.push({ userId, type, data });
        },
        now: new Date()
    });

    assert.strictEqual(summary.sessionCount, 1, 'Expected one upcoming session');
    assert.strictEqual(summary.notificationsSent, 2, 'Expected two reminder notifications');
    assert(notificationCalls.every((call) => call.type === 'session_reminder'), 'Expected reminder type only');
}

async function run() {
    await testNotificationHelper();
    await testSessionReminderJob();
    console.log('notification-hooks-tests: PASS');
}

run().catch((error) => {
    console.error('notification-hooks-tests: FAIL');
    console.error(error);
    process.exit(1);
});
