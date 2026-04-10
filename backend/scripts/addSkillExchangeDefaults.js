const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function runMigration() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
    });

    const result = await User.updateMany(
        {
            $or: [
                { credits: { $exists: false } },
                { trustScore: { $exists: false } },
                { noShowCount: { $exists: false } },
                { credits: null },
                { trustScore: null },
                { noShowCount: null }
            ]
        },
        [
            {
                $set: {
                    credits: { $ifNull: ['$credits', 10] },
                    trustScore: { $ifNull: ['$trustScore', 100] },
                    noShowCount: { $ifNull: ['$noShowCount', 0] }
                }
            }
        ]
    );

    const matched = result.matchedCount || 0;
    const updated = result.modifiedCount || 0;
    console.log(`[skill-exchange-migration] Matched users: ${matched}`);
    console.log(`[skill-exchange-migration] Updated users: ${updated}`);
}

runMigration()
    .then(async () => {
        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('[skill-exchange-migration] Failed:', error.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    });
