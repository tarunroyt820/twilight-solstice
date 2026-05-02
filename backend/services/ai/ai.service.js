const { Readable } = require("stream");
const groqService = require("./groq.service");
const huggingfaceService = require("./huggingface.service");

let validateProviderConfig;
try {
    ({ validateProviderConfig } = require("./aiConfig"));
} catch (_error) {
    validateProviderConfig = (provider) => {
        const resolved = (provider || process.env.AI_PROVIDER || "groq").toLowerCase();

        if (resolved !== "groq" && resolved !== "huggingface" && resolved !== "hf") {
            return {
                valid: false,
                code: "AI_PROVIDER_UNSUPPORTED",
                message: `Unsupported AI provider: ${resolved}`
            };
        }

        if (resolved === "groq") {
            const value = process.env.GROQ_API_KEY;
            if (!value || value.startsWith("REPLACE_")) {
                return {
                    valid: false,
                    code: "AI_NOT_CONFIGURED",
                    message: "GROQ_API_KEY is missing for provider groq"
                };
            }
        }

        if (resolved === "huggingface" || resolved === "hf") {
            const value = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.HF_API_TOKEN;
            if (!value || value.startsWith("REPLACE_")) {
                return {
                    valid: false,
                    code: "AI_NOT_CONFIGURED",
                    message: "HUGGINGFACE_API_KEY is missing for provider huggingface"
                };
            }

            const model = process.env.HF_MODEL || process.env.HF_CHAT_MODEL || process.env.HF_HEAVY_MODEL || process.env.HF_SKILLGAP_MODEL;
            if (!model) {
                return {
                    valid: false,
                    code: "AI_NOT_CONFIGURED",
                    message: "HF_MODEL is missing for provider huggingface"
                };
            }
        }

        return { valid: true };
    };
}

const withTimeout = (promise, ms, label) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
};

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 60000);

const callProvider = async (provider, message, options = {}) => {
    const normalized = (provider || process.env.AI_PROVIDER || "groq").toLowerCase();
    const validation = validateProviderConfig(normalized);
    if (!validation.valid) {
        const error = new Error(validation.message);
        error.code = validation.code;
        throw error;
    }

    if (normalized === "groq") {
        return groqService.generateResponse(message, options);
    }

    if (normalized === "huggingface" || normalized === "hf") {
        return huggingfaceService.generateResponse(message, options);
    }

    const error = new Error(`Unsupported AI provider: ${normalized}`);
    error.code = "AI_PROVIDER_UNSUPPORTED";
    throw error;
};

const normalizeOptions = (preferredProvider) => {
    if (!preferredProvider) {
        return {
            provider: process.env.AI_PROVIDER || "groq",
            model: undefined,
        };
    }

    if (typeof preferredProvider === "string") {
        return {
            provider: preferredProvider,
            model: undefined,
        };
    }

    return {
        provider: preferredProvider.provider || process.env.AI_PROVIDER || "groq",
        model: preferredProvider.model,
    };
};

const generate = async (message, preferredProvider) => {
    const normalized = normalizeOptions(preferredProvider);
    const provider = (normalized.provider || process.env.AI_PROVIDER || "groq").toLowerCase();

    try {
        console.log(`[AI SERVICE] Trying provider: ${provider}${normalized.model ? ` model: ${normalized.model}` : ""} (timeout: ${AI_TIMEOUT_MS}ms)`);
        const text = await withTimeout(callProvider(provider, message, { model: normalized.model }), AI_TIMEOUT_MS, provider);
        console.log(`[AI SERVICE] Success with: ${provider}`);
        return { providerUsed: provider, modelUsed: normalized.model, text };
    } catch (err) {
        console.warn(`[AI SERVICE] ${provider} failed: ${err.message}`);
        const error = new Error(err.message || "AI provider failed");
        error.code = err.code || "AI_PROVIDER_UNAVAILABLE";
        error.status = err.status || 503;
        error.details = err.details || null;
        throw error;
    }
};

const generateStream = async (message, preferredProvider) => {
    const normalized = normalizeOptions(preferredProvider);
    const provider = (normalized.provider || process.env.AI_PROVIDER || "groq").toLowerCase();

    if ((provider === "huggingface" || provider === "hf") && typeof huggingfaceService.generateResponseStream === "function") {
        try {
            console.log(`[AI SERVICE] Streaming with provider: ${provider}${normalized.model ? ` model: ${normalized.model}` : ""}`);
            return await huggingfaceService.generateResponseStream(message, { model: normalized.model });
        } catch (err) {
            console.warn(`[AI SERVICE] ${provider} stream failed: ${err.message}`);
            const error = new Error(err.message || "AI provider stream failed");
            error.code = err.code || "AI_PROVIDER_UNAVAILABLE";
            error.status = err.status || 503;
            error.details = err.details || null;
            throw error;
        }
    }

    const result = await generate(message, preferredProvider);
    const parts = (result.text || "").match(/.{1,80}(\s|$)|\S+/g) || [result.text || ""];

    async function* chunkGenerator() {
        for (const part of parts) {
            await new Promise((resolve) => setTimeout(resolve, 35));
            yield part;
        }
    }

    return Readable.from(chunkGenerator());
};

const getAIResponse = async (prompt) => generate(prompt, process.env.AI_PROVIDER || "groq");

module.exports = { generate, generateStream, getAIResponse };
