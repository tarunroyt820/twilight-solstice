// IMPORTANT: Load .env from the backend directory using __dirname.
// This guarantees dotenv always finds backend/.env no matter where
// the process is started from (root npm run dev:all or inside backend/).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { expireOldRequests } = require('./jobs/requestExpiryJob');
const { runReminderJob } = require('./jobs/reminderJob');
const { runQualityScoreJob } = require('./jobs/qualityScoreJob');
const { runCareerPlanReminderJob } = require('./jobs/careerPlanMilestoneReminderJob');
const { initializeQueue, closeQueue } = require('./queues/aiQueue');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForDatabase = async () => {
    while (!connectDB.isDatabaseConnected()) {
        try {
            await connectDB();
        } catch (error) {
            console.error(`[db] Waiting for MongoDB before opening the API: ${error.message}`);
            await sleep(5000);
        }
    }
};

const startServer = async () => {
    const PORT = process.env.PORT || 5000;

    await waitForDatabase();

    // Initialize AI queue
    try {
        await initializeQueue();
    } catch (err) {
        console.warn(`[QUEUE] Failed to initialize AI queue: ${err.message}`);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`[BUILD] AI stack: Groq / Hugging Face`);
        console.log(`AI Provider: ${process.env.AI_PROVIDER || 'groq (default)'}`);
        console.log(`Groq key loaded: ${process.env.GROQ_API_KEY ? 'YES' : 'NO - check backend/.env'}`);
        console.log(`HF token loaded: ${(process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN) ? 'YES' : 'NO - check backend/.env'}`);
        console.log(`CORS allows: ${process.env.FRONTEND_URL || 'http://localhost:5173 (default)'}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n[SERVER] Gracefully shutting down...');
        await closeQueue();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n[SERVER] Gracefully shutting down...');
        await closeQueue();
        process.exit(0);
    });

    setInterval(() => {
        expireOldRequests().catch((error) => {
            console.error(`[request-expiry] Failed to run expiry job: ${error.message}`);
        });
    }, 60 * 60 * 1000);

    // Run reminders every 15 minutes for reliable window capture.
    setInterval(() => {
        runReminderJob().catch((error) => {
            console.error(`[reminder-job] Failed to run reminder job: ${error.message}`);
        });
    }, 15 * 60 * 1000);

    // Run career plan milestone reminders every 30 minutes
    setInterval(() => {
        runCareerPlanReminderJob().catch((error) => {
            console.error(`[career-plan-reminder] Failed to run job: ${error.message}`);
        });
    }, 30 * 60 * 1000);

    // Prime quality score metrics quickly, then refresh every hour.
    runQualityScoreJob().catch((error) => {
        console.error(`[quality-score] Initial run failed: ${error.message}`);
    });

    setInterval(() => {
        runQualityScoreJob().catch((error) => {
            console.error(`[quality-score] Hourly run failed: ${error.message}`);
        });
    }, 60 * 60 * 1000);
};

startServer();
