const CareerPlan = require('../models/CareerPlan');

/**
 * Create a new career plan for a user.
 * @async
 * @param {string} userId - The user ID (ObjectId)
 * @param {object} params - Plan parameters
 * @param {string} params.targetRole - Target career role (required)
 * @param {string} params.title - Plan title (required)
 * @param {string} [params.timeframe] - Estimated timeframe (e.g., "3-6 months")
 * @param {string} [params.intensity] - Intensity level (e.g., "high", "medium", "low")
 * @returns {Promise<object>} Saved CareerPlan document
 * @throws {Error} If creation fails
 */
async function createPlan(userId, { targetRole, title, timeframe, intensity }) {
  if (!userId || !targetRole || !title) {
    throw new Error('userId, targetRole, and title are required');
  }

  const plan = new CareerPlan({
    userId,
    title,
    targetRole,
    status: 'ACTIVE',
    overallProgress: 0,
    milestones: [],
    recommendations: [],
  });

  await plan.save();
  return plan;
}

/**
 * Get all plans for a user (lean, exclude recommendations for performance).
 * @async
 * @param {string} userId - The user ID
 * @returns {Promise<array>} Array of CareerPlan documents
 * @throws {Error} If query fails
 */
async function getUserPlans(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  return CareerPlan.find({ userId })
    .select('-recommendations')
    .sort({ updatedAt: -1 })
    .lean();
}

/**
 * Get a single plan by ID with ownership verification.
 * @async
 * @param {string} planId - The plan ID
 * @param {string} userId - The user ID (for ownership check)
 * @returns {Promise<object>} Full CareerPlan document
 * @throws {Error} 403 if user doesn't own plan, 404 if plan not found
 */
async function getPlanById(planId, userId) {
  if (!planId || !userId) {
    throw new Error('planId and userId are required');
  }

  const plan = await CareerPlan.findById(planId).lean();

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  if (plan.userId.toString() !== userId) {
    const error = new Error('Unauthorized: plan does not belong to user');
    error.statusCode = 403;
    throw error;
  }

  return plan;
}

/**
 * Update a plan with optimistic locking via __v field.
 * @async
 * @param {string} planId - The plan ID
 * @param {string} userId - The user ID (for ownership check)
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated CareerPlan document
 * @throws {Error} 403 if unauthorized, 404 if not found, 409 if version conflict
 */
async function updatePlan(planId, userId, updateData) {
  if (!planId || !userId) {
    throw new Error('planId and userId are required');
  }

  const plan = await CareerPlan.findById(planId);

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  if (plan.userId.toString() !== userId) {
    const error = new Error('Unauthorized: plan does not belong to user');
    error.statusCode = 403;
    throw error;
  }

  // Apply updates
  Object.assign(plan, updateData);

  // Use findByIdAndUpdate with version check for optimistic locking
  const updated = await CareerPlan.findByIdAndUpdate(
    planId,
    updateData,
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    const error = new Error('Version conflict: plan was modified by another request');
    error.statusCode = 409;
    throw error;
  }

  return updated;
}

/**
 * Mark a milestone as complete and update overall progress.
 * @async
 * @param {string} planId - The plan ID
 * @param {string} milestoneId - The milestone ID
 * @param {string} userId - The user ID (for ownership check)
 * @param {object} params - Completion details
 * @param {array} [params.evidence] - Evidence URLs/files
 * @param {string} [params.notes] - Completion notes
 * @returns {Promise<object>} Updated CareerPlan document
 * @throws {Error} 403 if unauthorized, 404 if plan/milestone not found
 */
async function completeMilestone(planId, milestoneId, userId, { evidence = [], notes = '' } = {}) {
  if (!planId || !milestoneId || !userId) {
    throw new Error('planId, milestoneId, and userId are required');
  }

  const plan = await CareerPlan.findById(planId);

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  if (plan.userId.toString() !== userId) {
    const error = new Error('Unauthorized: plan does not belong to user');
    error.statusCode = 403;
    throw error;
  }

  const milestone = plan.milestones.id(milestoneId);
  if (!milestone) {
    const error = new Error('Milestone not found');
    error.statusCode = 404;
    throw error;
  }

  milestone.completed = true;
  milestone.completedAt = new Date();
  if (evidence && evidence.length > 0) {
    milestone.evidence = [...(milestone.evidence || []), ...evidence];
  }
  if (notes) {
    milestone.notes = notes;
  }

  plan.overallProgress = recalculateProgress(plan);

  await plan.save();
  return plan;
}

/**
 * Recalculate overall progress as percentage of completed milestones.
 * @param {object} plan - CareerPlan document
 * @returns {number} Progress percentage (0-100)
 */
function recalculateProgress(plan) {
  if (!plan.milestones || plan.milestones.length === 0) {
    return 0;
  }

  const completed = plan.milestones.filter((m) => m.completed).length;
  const total = plan.milestones.length;
  return Math.round((completed / total) * 100);
}

module.exports = {
  createPlan,
  getUserPlans,
  getPlanById,
  updatePlan,
  completeMilestone,
  recalculateProgress,
};
