const express = require("express");
const { protect } = require("../middleware/auth");
const controller = require("../controllers/agreementMessageController");

const router = express.Router();

router.get("/inbox", protect, controller.listInbox);
router.get("/:agreementId/messages", protect, controller.getMessages);
router.post("/:agreementId/messages", protect, controller.sendMessage);

module.exports = router;
