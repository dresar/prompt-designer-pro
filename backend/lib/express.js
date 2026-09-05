// backend/lib/express.js
// Express application factory — creates and configures the full Express app

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.js";

// Middleware
import { helmetMiddleware, sanitizeInput, apiSecurityHeaders } from "../middleware/security.middleware.js";
import { requestLogger } from "../middleware/logger.middleware.js";
import { generalLimiter } from "../middleware/rateLimiter.middleware.js";
import { globalErrorHandler, notFoundHandler } from "../middleware/error.middleware.js";
import corsOptions from "../config/cors.js";

// Routes
import authRoutes from "../routes/auth.routes.js";
import promptRoutes from "../routes/prompt.routes.js";
import templateRoutes from "../routes/template.routes.js";
import notificationRoutes from "../routes/notification.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import healthRoutes from "../routes/health.routes.js";
import systemRoutes from "../routes/system.routes.js";
import optionRoutes from "../routes/option.routes.js";

import config from "../config/index.js";
import logger from "../utils/logger.js";

/**
 * Create and configure the Express application
 * @returns {express.Application}
 */
export function createApp() {
  const app = express();

  // ─── Trust proxy (Vercel / load balancers) ────────────────────────────────
  app.set("trust proxy", 1);

  // ─── Security headers ─────────────────────────────────────────────────────
  app.use(helmetMiddleware);
  app.use(apiSecurityHeaders);

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions)); // Preflight

  // ─── Compression ──────────────────────────────────────────────────────────
  app.use(compression());

  // ─── Cookie parser ────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Body parsers ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ─── Input sanitization ───────────────────────────────────────────────────
  app.use(sanitizeInput);

  // ─── Request logging ──────────────────────────────────────────────────────
  app.use(requestLogger);

  // ─── General rate limiter ─────────────────────────────────────────────────
  app.use("/api", generalLimiter);

  // ─── Swagger UI ───────────────────────────────────────────────────────────
  if (!config.isProduction) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "PromptStudio AI — API Docs",
    }));
    logger.info("API Docs available at /api/docs");
  }

  // ─── Static uploads (local dev only) ─────────────────────────────────────
  if (!config.cloudinary.enabled && !config.isVercel) {
    app.use("/uploads", express.static(config.upload.uploadDir));
  }

  // ─── API Routes ───────────────────────────────────────────────────────────
  const API = config.server.apiPrefix; // "/api"

  app.use(`${API}/health`, healthRoutes);
  app.use(`${API}/system`, systemRoutes);
  app.use(`${API}/auth`, authRoutes);
  app.use(`${API}/prompts`, promptRoutes);
  app.use(`${API}/templates`, templateRoutes);
  app.use(`${API}/options`, optionRoutes);
  app.use(`${API}/notifications`, notificationRoutes);
  app.use(`${API}/admin`, adminRoutes);

  // ─── 404 handler ──────────────────────────────────────────────────────────
  app.use(`${API}/*`, notFoundHandler);

  // ─── Global error handler (must be last) ──────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}
