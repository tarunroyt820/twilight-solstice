const express = require('express');
const router = express.Router();
const controller = require('../controllers/careerPlanController');

// Ensure auth middleware has already attached req.user to request
// These routes assume req.user is populated by a prior auth middleware

/**
 * POST /api/career-plans
 * Create a new career plan
 */
router.post('/', controller.createPlan);

/**
 * GET /api/career-plans
 * List all plans for the authenticated user
 */
router.get('/', controller.listPlans);

/**
 * GET /api/career-plans/:id
 * Get a single plan by ID
 */
router.get('/:id', controller.getPlan);

/**
 * PATCH /api/career-plans/:id
 * Update a plan (title, status, notes, etc)
 */
router.patch('/:id', controller.updatePlan);

/**
 * POST /api/career-plans/:id/complete-milestone
 * Mark a milestone as complete
 */
router.post('/:id/complete-milestone', controller.completeMilestone);

/**
 * POST /api/career-plans/:id/refresh
 * Refresh AI recommendations for the plan
 */
router.post('/:id/refresh', controller.refreshPlan);

module.exports = router;
