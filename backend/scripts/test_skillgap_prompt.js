require("dotenv").config();

const ai = require("../services/ai/ai.service");

const question = "Perform a detailed skill gap analysis for me if I want to become a Full-Stack Developer. Based on my current profile skills, tell me: 1) Skills I already have that are relevant, 2) Skills I am missing, 3) A prioritised learning plan with estimated timeframes. Format clearly using markdown.";

const prompt = [
    "SYSTEM PROMPT: You are a career guidance AI assistant. Be concise.",
    `USER QUESTION:\n\"${question}\"`,
].join("\n\n");

(async () => {
    try {
        const result = await ai.generate(prompt, {
            provider: "groq",
            model: process.env.GROQ_SKILLGAP_MODEL || process.env.GROQ_HEAVY_MODEL || process.env.GROQ_MODEL,
        });

        console.log("providerUsed:", result.providerUsed);
        console.log("modelUsed:", result.modelUsed);
        console.log("textLength:", (result.text || "").length);
        console.log("preview:", (result.text || "").slice(0, 300));
    } catch (error) {
        console.error("ERROR:", error.message);
        console.error("CODE:", error.code);
        console.error("STATUS:", error.status);
        if (error.details) {
            console.error("DETAILS:", JSON.stringify(error.details));
        }
        process.exit(1);
    }
})();
