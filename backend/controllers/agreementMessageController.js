const mongoose = require("mongoose");
const Agreement = require("../models/Agreement");
const AgreementMessage = require("../models/AgreementMessage");

const isParticipant = (agreement, userId) => {
    return Array.isArray(agreement?.participants)
        && agreement.participants.some((participantId) => participantId.toString() === userId.toString());
};

const markThreadAsRead = async (agreementId, userId) => {
    await AgreementMessage.updateMany(
        {
            agreementId,
            senderId: { $ne: userId },
            readBy: { $ne: userId }
        },
        {
            $addToSet: { readBy: userId }
        }
    );
};

exports.listInbox = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const agreements = await Agreement.find({ participants: userId })
            .populate("participants", "fullName profilePhotoUrl lastActiveAt")
            .sort({ updatedAt: -1 })
            .lean();

        const summaries = await Promise.all(
            agreements.map(async (agreement) => {
                const [latestMessage, unreadCount] = await Promise.all([
                    AgreementMessage.findOne({ agreementId: agreement._id })
                        .populate("senderId", "fullName profilePhotoUrl")
                        .sort({ createdAt: -1 })
                        .lean(),
                    AgreementMessage.countDocuments({
                        agreementId: agreement._id,
                        senderId: { $ne: userId },
                        readBy: { $ne: userId }
                    })
                ]);

                const partner = (agreement.participants || []).find(
                    (participant) => participant?._id?.toString() !== userId.toString()
                );

                return {
                    agreementId: agreement._id,
                    agreementStatus: agreement.status,
                    skill: agreement.skill,
                    updatedAt: latestMessage?.createdAt || agreement.updatedAt || agreement.createdAt,
                    unreadCount,
                    partner: partner
                        ? {
                            _id: partner._id,
                            fullName: partner.fullName || "Partner",
                            profilePhotoUrl: partner.profilePhotoUrl || "",
                            lastActiveAt: partner.lastActiveAt || null
                        }
                        : null,
                    latestMessage: latestMessage
                        ? {
                            _id: latestMessage._id,
                            message: latestMessage.message,
                            createdAt: latestMessage.createdAt,
                            systemMessage: Boolean(latestMessage.systemMessage),
                            senderId: latestMessage.senderId
                                ? {
                                    _id: latestMessage.senderId._id,
                                    fullName: latestMessage.senderId.fullName || ""
                                }
                                : null
                        }
                        : null
                };
            })
        );

        summaries.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

        return res.json({ success: true, inbox: summaries });
    } catch (error) {
        console.error("List inbox error:", error);
        return res.status(500).json({ message: "Failed to fetch inbox summaries" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { agreementId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(agreementId)) {
            return res.status(400).json({ message: "Invalid agreement id" });
        }

        const agreement = await Agreement.findById(agreementId).lean();

        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found" });
        }

        if (!isParticipant(agreement, userId)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await markThreadAsRead(agreementId, userId);

        const messages = await AgreementMessage.find({ agreementId })
            .populate("senderId", "fullName profilePhotoUrl")
            .sort({ createdAt: 1 })
            .lean();

        return res.json({ success: true, messages });
    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { agreementId } = req.params;
        const userId = req.user.id;
        const rawMessage = typeof req.body?.message === "string" ? req.body.message : "";
        const message = rawMessage.trim();

        if (!mongoose.Types.ObjectId.isValid(agreementId)) {
            return res.status(400).json({ message: "Invalid agreement id" });
        }

        if (!message) {
            return res.status(400).json({ message: "Message required" });
        }

        if (message.length > 2000) {
            return res.status(400).json({ message: "Message exceeds 2000 characters" });
        }

        const agreement = await Agreement.findById(agreementId).lean();

        if (!agreement) {
            return res.status(404).json({ message: "Agreement not found" });
        }

        if (!isParticipant(agreement, userId)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const newMessage = await AgreementMessage.create({
            agreementId,
            senderId: userId,
            readBy: [userId],
            message
        });

        const populatedMessage = await AgreementMessage.findById(newMessage._id)
            .populate("senderId", "fullName profilePhotoUrl")
            .lean();

        return res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({ message: "Failed to send message" });
    }
};
