const groqService = require("./groq.service");
const deepseekService = require("./deepseek.service");
const nvidiaService = require("./nvidia.service");

let validateProviderConfig;
try {
    ({ validateProviderConfig } = require("./aiConfig"));
} catch (_error) {
    // Demo-safe fallback validator if aiConfig helper is not present yet.
    validateProviderConfig = (provider) => {
        const keyByProvider = {
            groq: "GROQ_API_KEY",
            // gemini: "GEMINI_API_KEY",
            deepseek: "DEEPSEEK_API_KEY",
            nvidia: "NVIDIA_API_KEY"
        };

        const keyName = keyByProvider[provider];
        if (!keyName) {
            return {
                valid: false,
                code: "AI_PROVIDER_UNSUPPORTED",
                message: `Unsupported AI provider: ${provider}`
            };
        }

        const value = process.env[keyName];
        if (!value || value.startsWith("REPLACE_")) {
            return {
                valid: false,
                code: "AI_NOT_CONFIGURED",
                message: `${keyName} is missing for provider ${provider}`
            };
        }

        return { valid: true };
    };
}

// Priority order: DeepSeek -> NVIDIA -> Groq
const providers = [
    { name: "deepseek", service: deepseekService },
    { name: "nvidia", service: nvidiaService },
    { name: "groq", service: groqService }
];

/**
 * Main AI Gateway with optional fallback behavior.
 * Returns a structured result so callers can expose providerUsed safely.
 */
const getAIResponse = async (prompt) => {
    const selectedProvider = (process.env.AI_PROVIDER || "groq").toLowerCase();
    const enableFallback = (process.env.AI_ENABLE_FALLBACK || "false").toLowerCase() === "true";

    const primaryProvider = providers.find((p) => p.name === selectedProvider);
    if (!primaryProvider) {
        const unsupportedError = new Error(`Selected provider "${selectedProvider}" is not supported`);
        unsupportedError.code = "AI_PROVIDER_UNSUPPORTED";
        throw unsupportedError;
    }

    const primaryValidation = validateProviderConfig(selectedProvider);
    if (!primaryValidation.valid) {
        const configError = new Error(primaryValidation.message);
        configError.code = primaryValidation.code;
        throw configError;
    }

    try {
        const text = await primaryProvider.service.generateResponse(prompt);
        return { providerUsed: selectedProvider, text };
    } catch (_error) {
        if (!enableFallback) {
            const providerError = new Error("AI provider unavailable");
            providerError.code = "AI_PROVIDER_UNAVAILABLE";
            throw providerError;
        }
    }

    // Optional fallback chain: only runs when AI_ENABLE_FALLBACK=true.
    for (const provider of providers) {
        if (provider.name === selectedProvider) {
            continue;
        }

        const validation = validateProviderConfig(provider.name);
        if (!validation.valid) {
            // Skip intentionally unconfigured providers to avoid noisy failures.
            if (validation.code === "AI_NOT_CONFIGURED") {
                continue;
            }

            // For other validation failures, skip and continue fallback attempts.
            continue;
        }

        try {
            const text = await provider.service.generateResponse(prompt);
            return { providerUsed: provider.name, text };
        } catch (_error) {
            // Continue trying remaining configured providers.
        }
    }

    const providerError = new Error("AI provider unavailable");
    providerError.code = "AI_PROVIDER_UNAVAILABLE";
    throw providerError;
};

module.exports = { getAIResponse };
