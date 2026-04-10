const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.createDispute);
router.get('/:id', protect, exchangeController.getDisputeById);

module.exports = router;
