// backend/services/aiEngine.service.js
// AI Engine: provider abstraction, key rotation, retry logic, fallback chain
// Supports: Gemini → Groq → error (extensible to OpenAI, Claude, etc.)

import apiKeyService from "./apiKey.service.js";
import promptBuilderService from "./promptBuilder.service.js";
import prisma from "../lib/prisma.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import { ServiceUnavailable } from "../utils/response.js";

// Error codes that should trigger key rotation
const ROTATE_ON_ERROR_CODES = [
  429, 503, 529, // Rate limit / quota
  401, 403,      // Auth errors
];

const ROTATE_ON_ERROR_MSGS = [
  "quota", "rate limit", "limit exceeded", "insufficient_quota",
  "too many requests", "service unavailable",
];

function shouldRotateKey(err) {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  if (ROTATE_ON_ERROR_CODES.includes(Number(status))) return true;
  const msg = (err.message || "").toLowerCase();
  return ROTATE_ON_ERROR_MSGS.some((kw) => msg.includes(kw));
}

// ─── Provider Adapters ────────────────────────────────────────────────────

/**
 * Generate via Google Gemini
 * @param {string} apiKey
 * @param {string} modelName
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<{ text: string, tokensUsed: number }>}
 */
async function generateWithGemini(apiKey, modelName, systemPrompt, userPrompt) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName || "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const response = result.response;
  const text = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
  return { text, tokensUsed };
}

/**
 * Generate via Groq
 * @param {string} apiKey
 * @param {string} modelName
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<{ text: string, tokensUsed: number }>}
 */
async function generateWithGroq(apiKey, modelName, systemPrompt, userPrompt) {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: modelName || "llama-3.1-8b-instant",
    temperature: 0.7,
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content || "";
  const tokensUsed = completion.usage?.total_tokens || 0;
  return { text, tokensUsed };
}

const PROVIDER_ADAPTERS = {
  gemini: generateWithGemini,
  groq: generateWithGroq,
};

// ─── AI Engine ────────────────────────────────────────────────────────────

class AIEngineService {
  /**
   * Generate content using the AI engine with automatic key rotation and failover
   * @param {object} input - PromptInput from frontend
   * @param {object} options
   * @param {string} [options.preferredProvider] - Force a specific provider
   * @param {string} [options.userId]
   * @param {string} [options.promptHistoryId]
   * @returns {Promise<{ text: string, tokensUsed: number, provider: string, isDummy: boolean }>}
   */
  async generate(input, options = {}) {
    const { systemPrompt, userPrompt } = promptBuilderService.build(input);
    const startTime = Date.now();

    // Provider priority order
    const providerOrder = options.preferredProvider
      ? [options.preferredProvider, ...["gemini", "groq"].filter((p) => p !== options.preferredProvider)]
      : ["gemini", "groq"];

    let lastError = null;

    for (const providerSlug of providerOrder) {
      const result = await this._tryProvider(
        providerSlug,
        systemPrompt,
        userPrompt,
        { ...options, startTime }
      );

      if (result.success) {
        return {
          text: result.text,
          tokensUsed: result.tokensUsed,
          provider: providerSlug,
          responseMs: Date.now() - startTime,
          isDummy: false,
        };
      }
      lastError = result.error;
    }

    // All providers failed — check if we should return dummy
    logger.warn("All AI providers failed, returning dummy response", {
      error: lastError?.message,
      input: { topic: input.topic, slides: input.slides },
    });

    // Return dummy response so frontend doesn't break
    const local = promptBuilderService.buildLocal(input);
    return {
      text: local.prompt,
      caption: local.caption,
      json: local.json,
      tokensUsed: 0,
      provider: "local",
      responseMs: Date.now() - startTime,
      isDummy: true,
      error: lastError?.message,
    };
  }

  /**
   * Try all keys for a specific provider with retry logic
   * @private
   */
  async _tryProvider(providerSlug, systemPrompt, userPrompt, options = {}) {
    const adapter = PROVIDER_ADAPTERS[providerSlug];
    if (!adapter) return { success: false, error: new Error(`No adapter for ${providerSlug}`) };

    const keys = await apiKeyService.getAllActiveKeys(providerSlug);
    if (keys.length === 0) {
      logger.debug(`No active keys for provider: ${providerSlug}`);
      return { success: false, error: new Error("No active keys") };
    }

    let lastError = null;

    for (const keyInfo of keys) {
      const maxRetries = config.ai.maxRetries;
      let retryDelay = config.ai.retryDelay;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }

        try {
          const startMs = Date.now();

          // Timeout wrapper
          const result = await Promise.race([
            adapter(keyInfo.plainKey, keyInfo.defaultModel, systemPrompt, userPrompt),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("AI request timeout")), config.ai.timeout)
            ),
          ]);

          const responseMs = Date.now() - startMs;

          // Log usage
          await this._logUsage({
            apiKeyId: keyInfo.keyId,
            providerSlug,
            userId: options.userId,
            promptHistoryId: options.promptHistoryId,
            requestMs: responseMs,
            tokensUsed: result.tokensUsed,
            success: true,
          });

          await apiKeyService.recordSuccess(keyInfo.keyId);

          logger.info(`AI generation success`, {
            provider: providerSlug,
            key: keyInfo.label,
            tokens: result.tokensUsed,
            ms: responseMs,
          });

          return { success: true, text: result.text, tokensUsed: result.tokensUsed };
        } catch (err) {
          lastError = err;
          const errMsg = err.message || String(err);

          await apiKeyService.recordError(keyInfo.keyId, errMsg);
          await this._logUsage({
            apiKeyId: keyInfo.keyId,
            providerSlug,
            userId: options.userId,
            requestMs: Date.now() - (options.startTime || Date.now()),
            success: false,
            errorCode: String(err.status || err.code || "UNKNOWN"),
            errorMessage: errMsg,
          });

          logger.warn(`AI attempt ${attempt + 1}/${maxRetries + 1} failed`, {
            provider: providerSlug,
            key: keyInfo.label,
            error: errMsg,
          });

          // If error doesn't warrant retry, break immediately
          if (!shouldRotateKey(err) && attempt === 0) break;
          if (!shouldRotateKey(err)) continue;
          break; // Rotate to next key
        }
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Log API usage to database
   * @private
   */
  async _logUsage({ apiKeyId, providerSlug, userId, promptHistoryId, requestMs, tokensUsed, success, errorCode, errorMessage }) {
    try {
      const provider = await prisma.apiProvider.findUnique({ where: { slug: providerSlug } });
      await prisma.apiUsageLog.create({
        data: {
          apiKeyId: apiKeyId || null,
          providerId: provider?.id || null,
          userId: userId || null,
          promptHistoryId: promptHistoryId || null,
          requestMs,
          tokensUsed: tokensUsed || 0,
          success,
          errorCode: errorCode || null,
          errorMessage: errorMessage || null,
        },
      });
    } catch (err) {
      // Non-critical — don't throw
      logger.error("Failed to log AI usage", { error: err.message });
    }
  }

  /**
   * Check if any AI provider is available (for health check)
   */
  async checkProviderHealth() {
    const results = {};
    for (const slug of ["gemini", "groq"]) {
      const keys = await apiKeyService.getAllActiveKeys(slug);
      results[slug] = {
        available: keys.length > 0,
        activeKeys: keys.length,
      };
    }
    return results;
  }
}

const aiEngineService = new AIEngineService();
export default aiEngineService;
