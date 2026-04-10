const User = require('../models/User');
const Session = require('../models/Session');
const Agreement = require('../models/Agreement');
const CreditTransaction = require('../models/CreditTransaction');
const { updateTrustScore } = require('./trustScoreService');

const resolveSelected = async (queryOrPromise, fields) => {
    const resolved = await queryOrPromise;
    if (resolved && typeof resolved.select === 'function') {
        return resolved.select(fields);
    }
    return resolved;
};

const detectNoShowFromData = (session, agreement) => {
    if (!session || !agreement) {
        return { isNoShow: false, missingParticipants: [] };
    }

    const participantIds = (agreement.participants || []).map((id) => id.toString());
    const confirmedIds = (session.participantConfirmations || []).map((c) => c.userId.toString());
    const missingParticipants = participantIds.filter((participantId) => !confirmedIds.includes(participantId));

    return {
        isNoShow: missingParticipants.length > 0,
        missingParticipants
    };
};

const detectNoShow = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new Error('Session not found');
    }

    const agreement = await Agreement.findById(session.agreementId);
    if (!agreement) {
        throw new Error('Agreement not found');
    }

    return {
        session,
        agreement,
        ...detectNoShowFromData(session, agreement)
    };
};

const applyPenaltyWithDeps = async (deps, userId, reason) => {
    const { UserModel, CreditTransactionModel, updateTrustScoreFn } = deps;
    const user = await resolveSelected(
        UserModel.findById(userId),
        'credits trustScore noShowCount'
    );
    if (!user) throw new Error('User not found');

    user.noShowCount = Number(user.noShowCount || 0) + 1;
    await user.save();
    const trustUpdate = await updateTrustScoreFn(userId);

    const nextBalance = Number(user.credits || 0);
    await CreditTransactionModel.create({
        userId,
        amount: 0,
        balance: nextBalance,
        type: 'penalty',
        description: reason || 'No-show penalty applied'
    });

    return {
        userId: user._id,
        trustScore: trustUpdate.trustScore,
        noShowCount: user.noShowCount
    };
};

const applyPenalty = async (userId, reason) => {
    return applyPenaltyWithDeps(
        { UserModel: User, CreditTransactionModel: CreditTransaction, updateTrustScoreFn: updateTrustScore },
        userId,
        reason
    );
};

const compensateVictimWithDeps = async (deps, userId, amount) => {
    const { UserModel, CreditTransactionModel } = deps;
    const compensation = Math.max(0, Number(amount || 0));
    const user = await resolveSelected(
        UserModel.findByIdAndUpdate(
            userId,
            { $inc: { credits: compensation } },
            { new: true }
        ),
        'credits'
    );

    if (!user) throw new Error('User not found');

    await CreditTransactionModel.create({
        userId,
        amount: compensation,
        balance: user.credits,
        type: 'compensation',
        description: 'Compensation awarded for no-show incident'
    });

    return {
        userId,
        credits: user.credits
    };
};

const compensateVictim = async (userId, amount) => {
    return compensateVictimWithDeps(
        { UserModel: User, CreditTransactionModel: CreditTransaction },
        userId,
        amount
    );
};

module.exports = {
    detectNoShowFromData,
    detectNoShow,
    applyPenaltyWithDeps,
    applyPenalty,
    compensateVictimWithDeps,
    compensateVictim
};
