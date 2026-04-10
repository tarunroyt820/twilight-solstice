const state = {};

const FAILURE_THRESHOLD = 3;
const RECOVERY_TIME = 5 * 60 * 1000;

module.exports = {
    isHealthy: (provider) => {
        const s = state[provider];
        if (!s) return true;
        if (s.failures >= FAILURE_THRESHOLD) {
            if (Date.now() - s.lastFailure > RECOVERY_TIME) {
                delete state[provider];
                console.log(`[CIRCUIT] ${provider} recovered`);
                return true;
            }
            return false;
        }
        return true;
    },
    recordFailure: (provider) => {
        if (!state[provider]) state[provider] = { failures: 0, lastFailure: null };
        state[provider].failures += 1;
        state[provider].lastFailure = Date.now();
        console.warn(`[CIRCUIT] ${provider} failure count: ${state[provider].failures}`);
    },
    recordSuccess: (provider) => {
        delete state[provider];
    }
};
