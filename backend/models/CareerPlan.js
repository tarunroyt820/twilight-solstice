const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: String,
    completed: { type: Boolean, default: false }
});

const CareerPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    careerGoal: { type: String, required: true },
    milestones: [MilestoneSchema],
    weeklyTasks: [String],
    recommendedSkills: [String],
    recommendedCourses: [String],
    skillGapAnalysis: [String],
    status: { type: String, enum: ['active', 'completed', 'draft'], default: 'active' },
    providerUsed: String,
    createdByAI: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CareerPlan', CareerPlanSchema);
