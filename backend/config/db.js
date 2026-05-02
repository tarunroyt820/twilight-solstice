const mongoose = require('mongoose');

// NOTE: dotenv is loaded in server.js before this file is ever called.
// Do NOT add require('dotenv').config() here because it would load from the wrong path.

let retryTimer = null;
let connectPromise = null;
let listenersAttached = false;

mongoose.set('bufferCommands', false);

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const scheduleReconnect = () => {
    if (retryTimer) return;
    retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB().catch(() => {});
    }, 10000);
};

const attachConnectionListeners = () => {
    if (listenersAttached) {
        return;
    }

    listenersAttached = true;
    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected. Retrying in 10 seconds...');
        scheduleReconnect();
    });
};

const connectDB = async () => {
    if (isDatabaseConnected()) {
        return mongoose.connection;
    }

    if (connectPromise) {
        return connectPromise;
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined. Please add it to backend/.env');
        console.error('Get a free MongoDB cluster at: https://cloud.mongodb.com');
        return null;
    }

    attachConnectionListeners();

    try {
        connectPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 45000,
            family: 4,
        });

        const conn = await connectPromise;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        console.error('Check your MONGO_URI in backend/.env');
        console.error('If this is DNS related, switch DNS to 8.8.8.8 or 1.1.1.1 and retry.');
        scheduleReconnect();
        throw error;
    } finally {
        connectPromise = null;
    }
};

module.exports = connectDB;
module.exports.isDatabaseConnected = isDatabaseConnected;
