const OpenAI = require("openai");

const generateResponse = async (prompt) => {
    try {
        const client = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
        });

        const response = await client.chat.completions.create({
            model: process.env.NVIDIA_MODEL || "z-ai/glm4.7",
            messages: [
                { role: "system", content: "You are a career guidance assistant for Nextaro, an AI career path finder." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("NVIDIA Service Error:", error);
        throw new Error("Failed to generate response from NVIDIA");
    }
};

module.exports = { generateResponse };
