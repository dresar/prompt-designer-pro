// backend/middleware/rateLimiter.middleware.js
// Rate limiting — general + strict auth limiter

import rateLimit from "express-rate-limit";
import config from "../config/index.js";
import { sendError } from "../utils/response.js";

const rateLimitHandler = (req, res) => {
  sendError(res, {
    message: "Terlalu banyak request. Silakan coba lagi dalam beberapa menit.",
    statusCode: 429,
    code: "RATE_LIMIT_EXCEEDED",
  });
};

/**
 * General API rate limiter — 100 req/15min
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => config.isDevelopment && req.ip === "::1", // Skip localhost in dev
});

/**
 * Strict auth limiter — 10 req/15min (brute force protection)
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Only count failed requests
  keyGenerator: (req) => `auth:${req.ip}`, // Separate key for auth
});

/**
 * AI generation limiter — 30 req/min per user
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => `ai:${req.user?.id || req.ip}`,
});
