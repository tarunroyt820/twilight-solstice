const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { clean } = require('xss-clean/lib/xss');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const careerPlanRoutes = require('./routes/careerPlanRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
const requestsRoutes = require('./routes/requestsRoutes');
const agreementsRoutes = require('./routes/agreementsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');
const disputesRoutes = require('./routes/disputesRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

const app = express();

const sanitizeObject = (value) => {
    if (Array.isArray(value)) {
        return value.map(sanitizeObject);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, sanitizeObject(nestedValue)])
        );
    }

    if (typeof value === 'string') {
        return clean(value);
    }

    return value;
};

const xssProtectionMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach((key) => {
            req.query[key] = sanitizeObject(req.query[key]);
        });
    }

    next();
};

const selectedProvider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase();
const hasProviderKey = selectedProvider === 'deepseek'
    ? Boolean(process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN)
    : selectedProvider === 'groq'
        ? Boolean(process.env.GROQ_API_KEY)
        : false;

if (!process.env.JWT_SECRET || !hasProviderKey) {
    console.error('Missing critical environment variables. Check .env file.');
    process.exit(1);
}

// Security Middleware

app.use(helmet());

// XSS Attack Prevention
// XSS protection re-enabled
app.use(xssProtectionMiddleware);

// CORS — allow localhost dev ports and the configured frontend URL
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }

        const isAllowed = allowedOrigins.includes(origin)
            || /^http:\/\/localhost:\d+$/.test(origin)
            || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many auth attempts, please wait a few minutes and try again.'
});
app.use('/api/auth/', (req, res, next) => {
    // Do not throttle refresh calls; they are part of normal session lifecycle.
    if (req.path === '/refresh') {
        return next();
    }

    return authLimiter(req, res, next);
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/career-plan', careerPlanRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!' 
    });
});

module.exports = app;
