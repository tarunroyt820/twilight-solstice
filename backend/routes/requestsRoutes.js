const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.createTradeRequest);
router.get('/', protect, exchangeController.listTradeRequests);
router.patch('/:id/accept', protect, exchangeController.acceptTradeRequest);
router.patch('/:id/decline', protect, exchangeController.declineTradeRequest);
router.patch('/:id/counter', protect, exchangeController.counterTradeRequest);

module.exports = router;
