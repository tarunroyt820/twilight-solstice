// IMPORTANT: Load .env from the backend directory using __dirname.
// This guarantees dotenv always finds backend/.env no matter where
// the process is started from (root npm run dev:all or inside backend/).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { setupRequestExpiryCron } = require('./services/requestExpiryService');
const { setupSessionReminderCron } = require('./jobs/sessionReminder');

const startServer = async () => {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`[BUILD] AI stack: DeepSeek via Hugging Face`);
        console.log(`AI Provider: ${process.env.AI_PROVIDER || 'deepseek (default)'}`);
        console.log(`Hugging Face key loaded: ${(process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN) ? 'YES' : 'NO - check backend/.env'}`);
        console.log(`CORS allows: ${process.env.FRONTEND_URL || 'http://localhost:5173 (default)'}`);
    });

    // Connect to Mongo in the background so the API can still boot even if
    // the database is slow or temporarily unreachable.
    connectDB();
    setupRequestExpiryCron();
    setupSessionReminderCron();
};

startServer();
