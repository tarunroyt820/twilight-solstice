const assert = require('assert');
const { calculateMatchScore } = require('../services/matchingService');
const {
    detectNoShowFromData,
    applyPenaltyWithDeps,
    compensateVictimWithDeps
} = require('../services/penaltyService');
const { checkRequestExpiryWithModel } = require('../services/requestExpiryService');
const { computeTrustScoreFromMetrics, updateTrustScoreWithDeps } = require('../services/trustScoreService');

async function testMatchingService() {
    const userA = {
        userId: 'u1',
        skillsOffered: [{ name: 'React' }],
        skillsWanted: [{ name: 'Node.js' }],
        trustScore: 92,
        availability: {
            weeklySlots: [{ day: 'monday', startTime: '10:00', endTime: '12:00' }]
        }
    };

    const userB = {
        userId: 'u2',
        skillsOffered: [{ name: 'Node.js' }],
        skillsWanted: [{ name: 'React' }],
        trustScore: 88,
        availability: {
            weeklySlots: [{ day: 'monday', startTime: '11:00', endTime: '13:00' }]
        }
    };

    const result = calculateMatchScore(userA, userB);
    assert(result.score > 0, 'Expected positive match score');
    assert(Array.isArray(result.reasons) && result.reasons.length > 0, 'Expected scoring reasons');

    const selfResult = calculateMatchScore(userA, userA);
    assert.strictEqual(selfResult.score, 0, 'Expected self-match score to be zero');
}

async function testPenaltyService() {
    const session = {
        participantConfirmations: [{ userId: 'u1' }]
    };
    const agreement = {
        participants: ['u1', 'u2']
    };
    const noShow = detectNoShowFromData(session, agreement);
    assert.strictEqual(noShow.isNoShow, true, 'Expected missing confirmation to trigger no-show');
    assert.deepStrictEqual(noShow.missingParticipants, ['u2']);

    let mockUser = {
        _id: 'u2',
        credits: 10,
        trustScore: 100,
        noShowCount: 0,
        save: async function save() { return this; }
    };
    const transactions = [];

    const deps = {
        UserModel: {
            findById: () => ({
                select: async () => mockUser
            }),
            findByIdAndUpdate: async (id, update) => {
                mockUser.credits += update.$inc.credits;
                return {
                    select: async () => mockUser
                };
            }
        },
        CreditTransactionModel: {
            create: async (payload) => {
                transactions.push(payload);
                return payload;
            }
        },
        updateTrustScoreFn: async () => ({ trustScore: 85 })
    };

    const penalty = await applyPenaltyWithDeps(deps, 'u2', 'No-show');
    assert.strictEqual(penalty.noShowCount, 1, 'Expected noShowCount increment');
    const compensation = await compensateVictimWithDeps(deps, 'u2', 3);
    assert.strictEqual(compensation.credits, 13, 'Expected compensation to add credits');
    assert.strictEqual(transactions.length, 2, 'Expected penalty and compensation transactions');
}

async function testRequestExpiryService() {
    const updates = [];
    const model = {
        updateMany: async (query, update) => {
            updates.push({ query, update });
            return { modifiedCount: 1 };
        }
    };

    const result = await checkRequestExpiryWithModel(model);
    assert.strictEqual(result.expiredCount, 1, 'Expected one expired request update');
    assert.strictEqual(updates.length, 1, 'Expected updateMany to run once');
}

async function testTrustScoreService() {
    const baseline = computeTrustScoreFromMetrics({
        reviewAverage: 4.5,
        reviewCount: 2,
        noShowCount: 0,
        completionCount: 3
    });
    assert(baseline > 70, 'Expected healthy trust score');

    const userDoc = {
        _id: 'u3',
        trustScore: 100,
        noShowCount: 1,
        save: async function save() { return this; }
    };

    const updated = await updateTrustScoreWithDeps(
        {
            UserModel: {
                findById: () => ({ select: async () => userDoc })
            },
            ReviewModel: {
                find: () => ({ select: async () => [{ rating: 5 }, { rating: 4 }] })
            },
            AgreementModel: {
                countDocuments: async () => 2
            }
        },
        'u3'
    );

    assert(typeof updated.trustScore === 'number', 'Expected numeric trust score');
    assert(updated.trustScore >= 0 && updated.trustScore <= 100, 'Trust score should be bounded');
}

async function run() {
    await testMatchingService();
    await testPenaltyService();
    await testRequestExpiryService();
    await testTrustScoreService();
    console.log('exchange-services-tests: PASS');
}

run().catch((error) => {
    console.error('exchange-services-tests: FAIL');
    console.error(error);
    process.exit(1);
});
