const { Readable } = require("stream");
const { InferenceClient } = require("@huggingface/inference");

const RETRY_COUNT = Number(process.env.DEEPSEEK_RETRY_COUNT || 2);
const RETRY_DELAY_MS = Number(process.env.DEEPSEEK_RETRY_DELAY_MS || 800);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getApiKey = () => {
    const value = (process.env.HUGGINGFACE_API_KEY || process.env.HF_API_TOKEN || "").trim();
    return value;
};

const getModel = (options = {}) => {
    return options.model || process.env.DEEPSEEK_MODEL || "deepseek-ai/DeepSeek-R1";
};

const getClient = () => new InferenceClient(getApiKey());

const isTransientError = (error) => {
    const status = Number(error?.status || 0);
    return status === 429 || status === 502 || status === 503 || status === 504;
};

const summarizeError = (error) => ({
    message: error?.message || null,
    status: error?.status || null,
    details: error?.details || null,
});

const toProviderError = (error) => {
    const status = Number(error?.status || 0);
    const wrapped = new Error(
        status
            ? `DeepSeek request failed with status ${status}${error?.message ? `: ${error.message}` : ""}`
            : `DeepSeek request failed${error?.message ? `: ${error.message}` : ""}`
    );

    wrapped.code = "AI_PROVIDER_UNAVAILABLE";
    wrapped.status = status || 503;
    wrapped.details = summarizeError(error);
    return wrapped;
};

const normalizeModelName = (model) => {
    const raw = String(model || "deepseek-ai/DeepSeek-R1").trim();
    const lower = raw.toLowerCase();

    if (lower === "deepseek-ai/deepseek-r1") {
        return "deepseek-ai/DeepSeek-R1";
    }

    return raw;
};

const buildModelCandidates = (model) => {
    const normalized = normalizeModelName(model);
    const lower = normalized.toLowerCase();
    const candidates = [normalized];

    if (lower === "deepseek-ai/deepseek-r1") {
        candidates.push("deepseek-ai/DeepSeek-R1:novita");
    }

    if (lower.startsWith("deepseek-ai/deepseek-r1") && !normalized.includes(":")) {
        candidates.push("deepseek-ai/DeepSeek-R1:novita");
    }

    // De-duplicate while preserving order.
    return [...new Set(candidates)];
};

const isModelAccessError = (error) => {
    const status = Number(error?.status || 0);
    const message = String(error?.message || "").toLowerCase();
    return status === 404 || message.includes("model_not_found") || message.includes("does not exist") || message.includes("do not have access");
};

const buildChatOptions = (prompt, model) => {
    const temperature = Number(process.env.DEEPSEEK_TEMPERATURE || 0.6);
    const maxTokens = Number(process.env.DEEPSEEK_MAX_NEW_TOKENS || 1200);

    return {
        model: normalizeModelName(model),
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature,
        max_tokens: maxTokens,
    };
};

const generateResponse = async (prompt, options = {}) => {
    const apiKey = getApiKey();
    if (!apiKey || apiKey.startsWith("REPLACE_")) {
        const error = new Error("HUGGINGFACE_API_KEY is missing for provider deepseek");
        error.code = "AI_NOT_CONFIGURED";
        error.status = 503;
        throw error;
    }

    const model = getModel(options);
    const modelCandidates = buildModelCandidates(model);
    const client = getClient();

    let lastError = null;

    for (const candidateModel of modelCandidates) {
        for (let attempt = 1; attempt <= RETRY_COUNT + 1; attempt += 1) {
            try {
                const payload = await client.chatCompletion(buildChatOptions(prompt, candidateModel));
                return payload?.choices?.[0]?.message?.content || "";
            } catch (error) {
                lastError = error;
                const transient = isTransientError(error);
                const modelAccessError = isModelAccessError(error);
                console.error(
                    `[DEEPSEEK] model ${candidateModel} attempt ${attempt}/${RETRY_COUNT + 1} failed` +
                    `${error?.status ? ` (status: ${error.status})` : ""}` +
                    `${error?.message ? `: ${error.message}` : ""}`
                );

                if (modelAccessError) {
                    // Try next model alias immediately.
                    break;
                }

                if (!transient || attempt > RETRY_COUNT) break;
                await sleep(RETRY_DELAY_MS * attempt);
            }
        }
    }

    throw toProviderError(lastError);
};

const generateResponseStream = async (prompt, options = {}) => {
    const apiKey = getApiKey();
    if (!apiKey || apiKey.startsWith("REPLACE_")) {
        const error = new Error("HUGGINGFACE_API_KEY is missing for provider deepseek");
        error.code = "AI_NOT_CONFIGURED";
        error.status = 503;
        throw error;
    }

    const model = getModel(options);
    const modelCandidates = buildModelCandidates(model);
    const client = getClient();

    let stream;
    let lastError = null;
    for (const candidateModel of modelCandidates) {
        try {
            stream = await client.chatCompletionStream(buildChatOptions(prompt, candidateModel));
            break;
        } catch (error) {
            lastError = error;
            if (!isModelAccessError(error)) {
                throw toProviderError(error);
            }
            console.warn(`[DEEPSEEK] stream model ${candidateModel} unavailable, trying next alias`);
        }
    }

    if (!stream) {
        throw toProviderError(lastError);
    }

    async function* chunkGenerator() {
        try {
            for await (const chunk of stream) {
                const text = chunk?.choices?.[0]?.delta?.content;
                if (text) {
                    yield text;
                }
            }
        } catch (error) {
            throw toProviderError(error);
        }
    }

    return Readable.from(chunkGenerator());
};

module.exports = { generateResponse, generateResponseStream };