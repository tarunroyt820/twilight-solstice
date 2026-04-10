const express = require('express');
const { protect } = require('../middleware/auth');
const exchangeController = require('../controllers/exchangeController');

const router = express.Router();

router.post('/', protect, exchangeController.createSession);
router.get('/', protect, exchangeController.listSessions);
router.patch('/:id/confirm', protect, exchangeController.confirmSession);
router.patch('/:id/report-noshow', protect, exchangeController.reportNoShow);

module.exports = router;
