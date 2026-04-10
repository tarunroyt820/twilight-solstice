const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Skill name is required'],
            trim: true
        },
        category: {
            type: String,
            default: '',
            trim: true
        },
        proficiencyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            required: [true, 'Proficiency level is required']
        }
    },
    { _id: false }
);

const SkillProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true
        },
        skillsOffered: {
            type: [SkillSchema],
            default: []
        },
        skillsWanted: {
            type: [SkillSchema],
            default: []
        },
        bio: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1000, 'Bio cannot exceed 1000 characters']
        },
        hourlyRate: {
            type: Number,
            default: 0,
            min: [0, 'Hourly rate cannot be negative']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

SkillProfileSchema.index({ 'skillsOffered.name': 1 });
SkillProfileSchema.index({ 'skillsWanted.name': 1 });

module.exports = mongoose.model('SkillProfile', SkillProfileSchema);
