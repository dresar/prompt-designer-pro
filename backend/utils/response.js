// backend/utils/response.js
// Consistent JSON response helpers used by all controllers

/**
 * Send a success response
 * @param {import('express').Response} res
 * @param {object} options
 */
export function sendSuccess(res, { data = null, message = "Success", statusCode = 200, meta = null } = {}) {
  const body = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated list response
 * @param {import('express').Response} res
 * @param {object} options
 */
export function sendPaginated(res, { data, total, page, limit, message = "Success" } = {}) {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {object} options
 */
export function sendError(res, { message = "An error occurred", statusCode = 500, errors = null, code = null } = {}) {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  if (code) body.code = code;
  return res.status(statusCode).json(body);
}

/**
 * Create a standardized AppError
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string|null} code
   * @param {any} errors
   */
  constructor(message, statusCode = 500, code = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 Bad Request */
export const BadRequest = (msg, errors) => new AppError(msg, 400, "BAD_REQUEST", errors);

/** 401 Unauthorized */
export const Unauthorized = (msg = "Unauthorized") => new AppError(msg, 401, "UNAUTHORIZED");

/** 403 Forbidden */
export const Forbidden = (msg = "Access denied") => new AppError(msg, 403, "FORBIDDEN");

/** 404 Not Found */
export const NotFound = (msg = "Resource not found") => new AppError(msg, 404, "NOT_FOUND");

/** 409 Conflict */
export const Conflict = (msg = "Resource already exists") => new AppError(msg, 409, "CONFLICT");

/** 429 Too Many Requests */
export const TooManyRequests = (msg = "Too many requests") => new AppError(msg, 429, "RATE_LIMIT");

/** 503 Service Unavailable */
export const ServiceUnavailable = (msg = "Service temporarily unavailable") => new AppError(msg, 503, "SERVICE_UNAVAILABLE");
