const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.createReview);
router.get('/:userId', protect, exchangeController.getReviewsForUser);

module.exports = router;
