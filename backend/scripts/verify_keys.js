// Run this script to test if your API keys are working.
// Usage: cd backend && node scripts/verify_keys.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const aiService = require("../services/ai/ai.service");

const TEST_PROMPT = "Hello! In exactly 10 words, tell me one career tip for a software developer.";

async function testKeys() {
    console.log("\n========================================");
    console.log("   NEXTRO AI - KEY VERIFICATION TOOL   ");
    console.log("========================================\n");

    console.log("ENV CHECK:");
    console.log(`  AI_PROVIDER     : ${process.env.AI_PROVIDER || "groq"}`);
    console.log(`  GROQ_API_KEY    : ${process.env.GROQ_API_KEY ? "Loaded" : "Missing"}`);
    console.log(`  GROQ_MODEL      : ${process.env.GROQ_MODEL || "llama-3.1-8b-instant"}`);
    console.log(`  MONGO_URI       : ${process.env.MONGO_URI ? "Loaded" : "Missing"}`);
    console.log(`  JWT_SECRET      : ${process.env.JWT_SECRET ? "Loaded" : "Missing"}`);
    console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "Loaded" : "Missing"}`);
    console.log("");

    if (process.env.GROQ_API_KEY && !String(process.env.GROQ_API_KEY).startsWith("REPLACE_")) {
        console.log("\n1. Testing Groq (primary provider)...");
        try {
            const res = await aiService.generate(TEST_PROMPT, {
                provider: "groq",
                model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            });
            console.log("   Groq response:", String(res?.text || "").trim().substring(0, 100));
        } catch (err) {
            console.error("   GROQ FAILED:", err.message);
        }
    } else {
        console.log("\n1. Groq - Skipped (no key set)");
    }

    console.log("\n========================================");
    console.log("VERIFICATION COMPLETE");
    console.log("If all keys you set show Loaded, run: npm run dev:all");
    console.log("========================================\n");
}

testKeys();
