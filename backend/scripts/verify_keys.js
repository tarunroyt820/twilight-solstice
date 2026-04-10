// Run this script to test if your API keys are working.
// Usage: cd backend && node scripts/verify_keys.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const deepseekService = require("../services/ai/deepseek.service");

const TEST_PROMPT = "Hello! In exactly 10 words, tell me one career tip for a software developer.";

async function testKeys() {
    console.log("\n========================================");
    console.log("   NEXTRO AI - KEY VERIFICATION TOOL   ");
    console.log("========================================\n");

    console.log("ENV CHECK:");
    console.log(`  AI_PROVIDER     : ${process.env.AI_PROVIDER || "deepseek"}`);
    console.log(`  HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? "Loaded" : "Missing"}`);
    console.log(`  HF_API_TOKEN    : ${process.env.HF_API_TOKEN ? "Loaded" : "Missing"}`);
    console.log(`  DEEPSEEK_MODEL  : ${process.env.DEEPSEEK_MODEL || "deepseek-ai/DeepSeek-R1"}`);
    console.log(`  MONGO_URI       : ${process.env.MONGO_URI ? "Loaded" : "Missing"}`);
    console.log(`  JWT_SECRET      : ${process.env.JWT_SECRET ? "Loaded" : "Missing"}`);
    console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "Loaded" : "Missing"}`);
    console.log("");

    if ((process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN) && !String(process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN).startsWith("REPLACE_")) {
        console.log("\n1. Testing DeepSeek via Hugging Face (primary provider)...");
        try {
            const res = await deepseekService.generateResponse(TEST_PROMPT);
            console.log("   DeepSeek response:", String(res).trim().substring(0, 100));
        } catch (err) {
            console.error("   DEEPSEEK FAILED:", err.message);
        }
    } else {
        console.log("\n1. DeepSeek - Skipped (no key set)");
    }

    console.log("\n========================================");
    console.log("VERIFICATION COMPLETE");
    console.log("If all keys you set show Loaded, run: npm run dev:all");
    console.log("========================================\n");
}

testKeys();
