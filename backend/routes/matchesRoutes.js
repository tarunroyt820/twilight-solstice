const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.get('/', protect, exchangeController.getMatches);

module.exports = router;
