const mongoose = require("mongoose");

const agreementMessageSchema = new mongoose.Schema(
    {
        agreementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agreement",
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        readBy: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }],
            default: []
        },
        message: {
            type: String,
            required: true,
            maxlength: 2000,
            trim: true
        },
        systemMessage: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for fast thread retrieval
agreementMessageSchema.index({ agreementId: 1, createdAt: 1 });
agreementMessageSchema.index({ agreementId: 1, readBy: 1, createdAt: -1 });

module.exports = mongoose.model("AgreementMessage", agreementMessageSchema);
