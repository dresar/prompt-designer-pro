// backend/middleware/logger.middleware.js
// HTTP request logger using Morgan-style format via Winston

import logger from "../utils/logger.js";

/**
 * Request logger middleware — logs method, url, status, response time, and user
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = req.user?.id ?? "anonymous";
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level](`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers["x-forwarded-for"],
      userId,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}
