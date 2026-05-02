const adminMiddleware = (req, res, next) => {
    const adminIds = String(process.env.ADMIN_USER_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (!req.user || !adminIds.includes(String(req.user.id || req.user._id))) {
        return res.status(403).json({ message: "Admin access required" });
    }

    return next();
};

module.exports = adminMiddleware;
