// Run this script to test if your API keys are working.
// Usage: cd backend && node scripts/verify_keys.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const groqService = require("../services/ai/groq.service");
const nvidiaService = require("../services/ai/nvidia.service");

const TEST_PROMPT = "Hello! In exactly 10 words, tell me one career tip for a software developer.";

async function testKeys() {
    console.log("\n========================================");
    console.log("   NEXTRO AI - KEY VERIFICATION TOOL   ");
    console.log("========================================\n");

    console.log("ENV CHECK:");
    console.log(`  GROQ_API_KEY    : ${process.env.GROQ_API_KEY ? "Loaded" : "Missing"}`);
    console.log(`  NVIDIA_API_KEY  : ${process.env.NVIDIA_API_KEY ? "Loaded" : "Missing"}`);
    console.log(`  MONGO_URI       : ${process.env.MONGO_URI ? "Loaded" : "Missing"}`);
    console.log(`  JWT_SECRET      : ${process.env.JWT_SECRET ? "Loaded" : "Missing"}`);
    console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "Loaded" : "Missing"}`);
    console.log("");

    console.log("1. Testing GROQ (primary AI provider)...");
    try {
        const res = await groqService.generateResponse(TEST_PROMPT);
        console.log("   Groq response:", res.trim().substring(0, 100));
    } catch (err) {
        console.error("   Groq FAILED:", err.message);
    }

    if (process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.startsWith("REPLACE_")) {
        console.log("\n2. Testing NVIDIA (optional provider)...");
        try {
            const res = await nvidiaService.generateResponse(TEST_PROMPT);
            console.log("   NVIDIA response:", res.trim().substring(0, 100));
        } catch (err) {
            console.error("   NVIDIA FAILED:", err.message);
        }
    } else {
        console.log("\n2. NVIDIA - Skipped (no key set, optional)");
    }

    console.log("\n========================================");
    console.log("VERIFICATION COMPLETE");
    console.log("If all keys you set show Loaded, run: npm run dev:all");
    console.log("========================================\n");
}

testKeys();
