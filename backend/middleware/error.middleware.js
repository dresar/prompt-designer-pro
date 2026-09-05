// backend/middleware/error.middleware.js
// Global error handler — must be registered LAST in Express app

import { AppError, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";

/**
 * Global error handling middleware.
 * Converts all errors into a consistent JSON response.
 * @type {import('express').ErrorRequestHandler}
 */
export function globalErrorHandler(err, req, res, next) {
  // Avoid double-response
  if (res.headersSent) return next(err);

  let statusCode = 500;
  let message = "Terjadi kesalahan internal server";
  let code = "INTERNAL_ERROR";
  let errors = null;

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || code;
    errors = err.errors;
  }
  // Prisma known request errors
  else if (err.code === "P2002") {
    statusCode = 409;
    message = "Data sudah ada (duplikat)";
    code = "CONFLICT";
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Data tidak ditemukan";
    code = "NOT_FOUND";
  } else if (err.code === "P2003") {
    statusCode = 400;
    message = "Referensi data tidak valid";
    code = "FOREIGN_KEY_ERROR";
  }
  // JWT errors (in case they bubble up)
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token tidak valid";
    code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token sudah kadaluarsa";
    code = "TOKEN_EXPIRED";
  }
  // Multer / file upload errors
  else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "Ukuran file terlalu besar";
    code = "FILE_TOO_LARGE";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Field file tidak diizinkan";
    code = "UNEXPECTED_FILE";
  }
  // CORS errors
  else if (err.message?.includes("CORS")) {
    statusCode = 403;
    message = "Akses dari origin ini tidak diizinkan";
    code = "CORS_ERROR";
  }

  // Log server errors (500+) with full stack trace
  if (statusCode >= 500) {
    logger.error("Server error", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
    });
  }

  sendError(res, {
    message,
    statusCode,
    code,
    errors,
    // Only include stack in development
    ...(config.isDevelopment && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

/**
 * 404 handler — for unmatched routes
 */
export function notFoundHandler(req, res) {
  sendError(res, {
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    statusCode: 404,
    code: "ROUTE_NOT_FOUND",
  });
}
