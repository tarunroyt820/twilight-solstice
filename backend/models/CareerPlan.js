const mongoose = require('mongoose');
const { Schema } = mongoose;

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['skill', 'project', 'certification', 'other'], default: 'skill' },
  estimateHours: { type: Number, default: 0 },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  evidence: [{ type: String }],
  notes: { type: String },
});

const RecommendationSchema = new Schema({
  source: { type: String, enum: ['AI', 'RULE', 'USER'], default: 'AI' },
  type: { type: String },
  payload: { type: Schema.Types.Mixed },
  confidence: { type: Number },
  accepted: { type: Boolean, default: null },
  modelVersion: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const CareerPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    targetRole: { type: String, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED'], default: 'ACTIVE' },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [MilestoneSchema],
    recommendations: [RecommendationSchema],
    notes: { type: String },
  },
  { timestamps: true, versionKey: '__v' }
);

module.exports = mongoose.model('CareerPlan', CareerPlanSchema);
