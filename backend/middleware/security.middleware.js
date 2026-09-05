// backend/middleware/security.middleware.js
// Security middleware: helmet, sanitization, maintenance mode check

import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import prisma from "../lib/prisma.js";
import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

/**
 * Helmet security headers — configured for API use
 */
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // CSP managed by frontend
});

/**
 * Input sanitization — prevent NoSQL injection patterns
 */
export const sanitizeInput = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ key }) => {
    logger.warn(`Sanitized suspicious input key: ${key}`);
  },
});

/**
 * Maintenance mode gate — checks Settings table.
 * Allows admin users and health endpoints through.
 */
export async function maintenanceMode(req, res, next) {
  try {
    // Always allow health + system routes
    if (
      req.path.startsWith("/api/health") ||
      req.path.startsWith("/api/system") ||
      req.path.startsWith("/api/auth/login") ||
      req.path.startsWith("/api/auth/demo") ||
      req.path.startsWith("/api/auth/refresh")
    ) {
      return next();
    }

    // Allow authenticated admins through
    if (req.user?.role === "admin") return next();

    const setting = await prisma.settings.findUnique({
      where: { key: "app.maintenanceMode" },
      select: { value: true },
    });

    if (setting?.value === "true") {
      return sendError(res, {
        message: "Sistem sedang dalam maintenance. Silakan coba beberapa saat lagi.",
        statusCode: 503,
        code: "MAINTENANCE_MODE",
      });
    }

    next();
  } catch {
    next(); // Don't block if settings check fails
  }
}

/**
 * Security headers for API responses
 */
export function apiSecurityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
}
