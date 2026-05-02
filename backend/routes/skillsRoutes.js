const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.upsertSkillProfile);
// Universal search for skill-exchange profiles (by name or skill)
router.get('/search', protect, exchangeController.searchExchangeUsers);
router.get('/:userId', protect, exchangeController.getSkillProfile);

module.exports = router;
