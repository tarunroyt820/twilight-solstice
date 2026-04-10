const express = require('express');
const router = express.Router();
const CareerPlan = require('../models/CareerPlan');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, aiController.generateCareerPlan);

router.get('/', protect, async (req, res) => {
    try {
        const plan = await CareerPlan.findOne({ userId: req.user.id });
        if (!plan) return res.status(404).json({ message: 'No career plan found' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch career plan' });
    }
});

router.patch('/milestone/:index', protect, async (req, res) => {
    try {
        const plan = await CareerPlan.findOne({ userId: req.user.id });
        if (!plan) return res.status(404).json({ message: 'No career plan found' });
        if (!plan.milestones[req.params.index]) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        plan.milestones[req.params.index].completed = req.body.completed;
        plan.lastUpdated = new Date();
        await plan.save();
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update milestone' });
    }
});

module.exports = router;
