const OpenAI = require("openai");

const generateResponse = async (prompt) => {
    try {
        if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY.startsWith("REPLACE_")) {
            throw new Error("NVIDIA_API_KEY is missing or not set in backend/.env");
        }

        const nvidia = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
        });

        const response = await nvidia.chat.completions.create({
            model: process.env.NVIDIA_MODEL || "z-ai/glm4.7",
            messages: [
                {
                    role: "system",
                    content: "You are Nextro AI, an expert career counselor helping users with practical, personalized career advice.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("NVIDIA AI Service Error:", error.message);
        throw new Error("Failed to generate response from NVIDIA AI");
    }
};

module.exports = { generateResponse };
