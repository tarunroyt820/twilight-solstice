const cache = new Map();

const CACHE_TTL = 10 * 60 * 1000;

module.exports = {
    get: (userId) => {
        const entry = cache.get(userId);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_TTL) {
            cache.delete(userId);
            return null;
        }
        return entry.data;
    },
    set: (userId, data) => {
        cache.set(userId, { data, timestamp: Date.now() });
    },
    invalidate: (userId) => {
        cache.delete(userId);
    }
};
