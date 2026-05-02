const mongoose = require('mongoose');
const Agreement = require('../models/Agreement');
const AgreementMessage = require('../models/AgreementMessage');

const postSystemMessage = async (agreementId, message) => {
    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
        return null;
    }

    const normalizedMessage = typeof message === 'string' ? message.trim() : '';
    if (!normalizedMessage) {
        return null;
    }

    const agreement = await Agreement.findById(agreementId).select('participants').lean();
    if (!agreement || !Array.isArray(agreement.participants) || agreement.participants.length === 0) {
        return null;
    }

    const senderId = agreement.participants[0];

    return AgreementMessage.create({
        agreementId,
        senderId,
        message: normalizedMessage,
        systemMessage: true
    });
};

module.exports = {
    postSystemMessage
};
