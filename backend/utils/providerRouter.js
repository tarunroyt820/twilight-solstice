const PROVIDER_POLICY = {
    chat: 'deepseek',
    roadmap: 'deepseek',
    skillgap: 'deepseek',
    resume: 'deepseek',
    reasoning: 'deepseek'
};

const MODEL_POLICY = {
    chat: process.env.DEEPSEEK_CHAT_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-R1',
    roadmap: process.env.DEEPSEEK_HEAVY_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-R1',
    skillgap: process.env.DEEPSEEK_HEAVY_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-R1',
    resume: process.env.DEEPSEEK_HEAVY_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-R1',
    reasoning: process.env.DEEPSEEK_HEAVY_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-R1'
};

const classifyIntent = (message = '') => {
    const lower = message.toLowerCase();
    if (lower.includes('roadmap') || lower.includes('plan') || lower.includes('career path')) return 'roadmap';
    if (lower.includes('skill gap') || lower.includes('missing skill')) return 'skillgap';
    if (lower.includes('resume') || lower.includes('cv')) return 'resume';
    if (lower.includes('explain') || lower.includes('why') || lower.includes('compare')) return 'reasoning';
    return 'chat';
};

module.exports = {
    getProvider: (message) => {
        const intent = classifyIntent(message);
        return {
            provider: PROVIDER_POLICY[intent],
            model: MODEL_POLICY[intent],
            intent
        };
    }
};
