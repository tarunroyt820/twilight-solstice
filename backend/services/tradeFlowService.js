const MAX_ACTIVE_EXCHANGES = 3;
const REQUEST_EXPIRY_HOURS = 48;

const normalizeTradeMessage = (message) => {
    if (typeof message !== 'string') return '';
    return message.trim();
};

const computeTradeRequestExpiry = (issuedAt = new Date()) => {
    const expiresAt = new Date(issuedAt instanceof Date ? issuedAt : new Date(issuedAt));
    expiresAt.setHours(expiresAt.getHours() + REQUEST_EXPIRY_HOURS);
    return expiresAt;
};

const buildTradeAgreement = (tradeRequest) => ({
    requestId: tradeRequest._id,
    participants: [tradeRequest.from, tradeRequest.to],
    skill: `${tradeRequest.offeredSkill} <-> ${tradeRequest.requestedSkill}`,
    duration: tradeRequest.proposedDuration,
    credits: tradeRequest.proposedCredits,
    status: 'active'
});

const validateTradeRequestDraft = ({
    to,
    offeredSkill,
    requestedSkill,
    proposedCredits,
    proposedDuration
}) => {
    if (!to || !offeredSkill || !requestedSkill || proposedCredits === undefined || proposedDuration === undefined) {
        return 'Missing required trade request fields';
    }

    return null;
};

const canAcceptTradeRequest = ({ tradeRequest, sender, receiver, now = new Date() }) => {
    if (!tradeRequest) {
        return { ok: false, statusCode: 404, message: 'Trade request not found' };
    }

    if (!receiver) {
        return { ok: false, statusCode: 404, message: 'Receiver not found' };
    }

    if (!sender) {
        return { ok: false, statusCode: 404, message: 'Sender not found' };
    }

    if (tradeRequest.status !== 'pending') {
        return { ok: false, statusCode: 400, message: 'Request is not pending' };
    }

    if (tradeRequest.expiresAt && new Date(tradeRequest.expiresAt) < now) {
        return { ok: false, statusCode: 400, message: 'Request has expired', expired: true };
    }

    if ((sender.activeExchangeCount || 0) >= MAX_ACTIVE_EXCHANGES) {
        return { ok: false, statusCode: 400, message: 'Sender has reached maximum active exchanges' };
    }

    if ((receiver.activeExchangeCount || 0) >= MAX_ACTIVE_EXCHANGES) {
        return { ok: false, statusCode: 400, message: 'Receiver has reached maximum active exchanges' };
    }

    return { ok: true };
};

module.exports = {
    MAX_ACTIVE_EXCHANGES,
    REQUEST_EXPIRY_HOURS,
    normalizeTradeMessage,
    computeTradeRequestExpiry,
    buildTradeAgreement,
    validateTradeRequestDraft,
    canAcceptTradeRequest
};