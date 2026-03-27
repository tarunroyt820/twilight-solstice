const User = require('../models/User');
const Message = require('../models/Message');

const truncate = (value, limit = 72) => {
    if (!value) return '';
    return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
};

const computeProfileCompletion = (user) => {
    const checks = [
        Boolean(user.fullName),
        Boolean(user.jobTitle),
        Boolean(user.experienceLevel),
        Boolean(user.careerGoal),
        Boolean(user.education?.college),
        Boolean(user.education?.degree),
        Array.isArray(user.skills) && user.skills.length > 0
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const buildRecommendations = (user) => {
    const skills = new Set((user.skills || []).map((skill) => skill.toLowerCase()));
    const goal = (user.careerGoal || '').toLowerCase();
    const recommendations = [];

    const addRecommendation = (name, level, demand, progress, category) => {
        if (recommendations.length < 3) {
            recommendations.push({
                id: `${category}-${recommendations.length + 1}`,
                name,
                level,
                demand,
                progress,
                category
            });
        }
    };

    if (goal.includes('engineer') && !skills.has('system design')) {
        addRecommendation('System Design', 'Intermediate', 'High', 15, 'system-design');
    }

    if (!skills.has('testing') && !skills.has('jest') && !skills.has('cypress')) {
        addRecommendation('Testing & Automation', 'Intermediate', 'Medium', 25, 'testing');
    }

    if (!skills.has('cloud') && !skills.has('aws') && !skills.has('azure')) {
        addRecommendation('Cloud Fundamentals', 'Beginner', 'High', 20, 'cloud');
    }

    if (!skills.has('communication')) {
        addRecommendation('Technical Communication', 'Beginner', 'Medium', 35, 'communication');
    }

    if (recommendations.length === 0) {
        addRecommendation('Advanced Problem Solving', 'Intermediate', 'High', 40, 'problem-solving');
    }

    return recommendations;
};

exports.getOverview = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('fullName jobTitle experienceLevel careerGoal education skills createdAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profileCompletion = computeProfileCompletion(user);
        const totalSections = 7;
        const sectionsCompleted = Math.round((profileCompletion / 100) * totalSections);
        const conversationCount = await Message.countDocuments({ userId: req.user.id });
        const recentActivityCount = await Message.countDocuments({
            userId: req.user.id,
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const latestMessages = await Message.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(5);

        const activityFeed = latestMessages.map((message) => ({
            id: message._id.toString(),
            type: message.role === 'user' ? 'career' : 'learning',
            title: message.role === 'user'
                ? `You asked: ${truncate(message.content, 70)}`
                : `AI replied: ${truncate(message.content, 70)}`,
            timestamp: message.timestamp
        }));

        const response = {
            success: true,
            message: 'Overview data loaded successfully',
            lastUpdated: new Date().toISOString(),
            user: {
                id: user._id,
                fullName: user.fullName || '',
                jobTitle: user.jobTitle || '',
                experienceLevel: user.experienceLevel || '',
                careerGoal: user.careerGoal || '',
                skillsCount: Array.isArray(user.skills) ? user.skills.length : 0,
                profileCompletion
            },
            overviewStats: {
                profileCompletion,
                skillsMastered: Array.isArray(user.skills) ? user.skills.length : 0,
                conversationCount,
                activityCount: recentActivityCount
            },
            trajectory: {
                title: 'Growth Trajectory',
                subtitle: user.careerGoal
                    ? `Your current goal: ${user.careerGoal}`
                    : 'Set a career goal to generate your roadmap',
                status: profileCompletion >= 75 ? 'on_track' : profileCompletion >= 50 ? 'attention' : 'at_risk',
                overallCompletion: profileCompletion,
                currentNode: user.jobTitle || user.experienceLevel || 'Profile incomplete',
                careerGoal: user.careerGoal || 'Not set yet',
                sectionsCompleted,
                sectionsTotal: totalSections,
                phaseLabels: ['Profile', 'Build', 'Goal']
            },
            activityFeed,
            recommendations: buildRecommendations(user),
            actions: {
                canGenerateReport: true,
                canRefreshRecommendations: true,
                reportAvailable: conversationCount > 0
            }
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
