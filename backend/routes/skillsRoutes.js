const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.upsertSkillProfile);
router.get('/:userId', protect, exchangeController.getSkillProfile);

module.exports = router;
