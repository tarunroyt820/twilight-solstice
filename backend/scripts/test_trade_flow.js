const assert = require('assert');
const {
    buildTradeAgreement,
    canAcceptTradeRequest,
    computeTradeRequestExpiry,
    normalizeTradeMessage,
    validateTradeRequestDraft,
    MAX_ACTIVE_EXCHANGES
} = require('../services/tradeFlowService');
const { checkRequestExpiryWithModel } = require('../services/requestExpiryService');
const { sendNotification } = require('../utils/notificationHelper');

async function testDraftValidation() {
    assert.strictEqual(validateTradeRequestDraft({}), 'Missing required trade request fields');
    assert.strictEqual(
        validateTradeRequestDraft({
            to: 'user-2',
            offeredSkill: 'React',
            requestedSkill: 'Node',
            proposedCredits: 3,
            proposedDuration: 60
        }),
        null
    );
}

async function testExpiryComputation() {
    const issuedAt = new Date('2026-04-30T10:00:00.000Z');
    const expiresAt = computeTradeRequestExpiry(issuedAt);
    assert.strictEqual(expiresAt.toISOString(), '2026-05-02T10:00:00.000Z');
}

async function testMessageNormalization() {
    assert.strictEqual(normalizeTradeMessage('  hello there  '), 'hello there');
    assert.strictEqual(normalizeTradeMessage(null), '');
}

async function testAgreementBuilder() {
    const agreement = buildTradeAgreement({
        _id: 'req-1',
        from: 'u1',
        to: 'u2',
        offeredSkill: 'React',
        requestedSkill: 'Node',
        proposedDuration: 90,
        proposedCredits: 4
    });

    assert.deepStrictEqual(agreement, {
        requestId: 'req-1',
        participants: ['u1', 'u2'],
        skill: 'React <-> Node',
        duration: 90,
        credits: 4,
        status: 'active'
    });
}

async function testAcceptChecks() {
    const baseTradeRequest = {
        status: 'pending',
        expiresAt: new Date('2026-05-02T10:00:00.000Z')
    };

    const valid = canAcceptTradeRequest({
        tradeRequest: baseTradeRequest,
        sender: { activeExchangeCount: 1 },
        receiver: { activeExchangeCount: 2 },
        now: new Date('2026-04-30T10:00:00.000Z')
    });
    assert.strictEqual(valid.ok, true);

    const senderBlocked = canAcceptTradeRequest({
        tradeRequest: baseTradeRequest,
        sender: { activeExchangeCount: MAX_ACTIVE_EXCHANGES },
        receiver: { activeExchangeCount: 0 },
        now: new Date('2026-04-30T10:00:00.000Z')
    });
    assert.strictEqual(senderBlocked.ok, false);
    assert.strictEqual(senderBlocked.message, 'Sender has reached maximum active exchanges');

    const receiverBlocked = canAcceptTradeRequest({
        tradeRequest: baseTradeRequest,
        sender: { activeExchangeCount: 0 },
        receiver: { activeExchangeCount: MAX_ACTIVE_EXCHANGES },
        now: new Date('2026-04-30T10:00:00.000Z')
    });
    assert.strictEqual(receiverBlocked.ok, false);
    assert.strictEqual(receiverBlocked.message, 'Receiver has reached maximum active exchanges');

    const expired = canAcceptTradeRequest({
        tradeRequest: { ...baseTradeRequest, expiresAt: new Date('2026-04-29T10:00:00.000Z') },
        sender: { activeExchangeCount: 0 },
        receiver: { activeExchangeCount: 0 },
        now: new Date('2026-04-30T10:00:00.000Z')
    });
    assert.strictEqual(expired.ok, false);
    assert.strictEqual(expired.expired, true);
}

async function testExpiryJob() {
    const updates = [];
    const model = {
        updateMany: async (query, update) => {
            updates.push({ query, update });
            return { modifiedCount: 2 };
        }
    };

    const result = await checkRequestExpiryWithModel(model);
    assert.strictEqual(result.expiredCount, 2);
    assert.strictEqual(updates[0].update.$set.status, 'expired');
}

async function testNotificationHelper() {
    const created = [];
    const NotificationModel = {
        create: async (payload) => {
            created.push(payload);
            return payload;
        }
    };

    const notification = await sendNotification('u2', 'request_accepted', { relatedId: 'agreement-1' }, { NotificationModel });
    assert.strictEqual(notification.userId, 'u2');
    assert.strictEqual(notification.type, 'request_accepted');
    assert.strictEqual(notification.message, 'Your trade request was accepted.');
    assert.strictEqual(created.length, 1);
}

async function run() {
    await testDraftValidation();
    await testExpiryComputation();
    await testMessageNormalization();
    await testAgreementBuilder();
    await testAcceptChecks();
    await testExpiryJob();
    await testNotificationHelper();
    console.log('trade-flow-tests: PASS');
}

run().catch((error) => {
    console.error('trade-flow-tests: FAIL');
    console.error(error);
    process.exit(1);
});