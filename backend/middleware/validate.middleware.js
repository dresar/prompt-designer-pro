// backend/middleware/validate.middleware.js
// Zod request validation middleware factory

import { z } from "zod";
import { sendError } from "../utils/response.js";

/**
 * Creates a middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return sendError(res, {
        message: "Validasi gagal",
        statusCode: 400,
        errors,
        code: "VALIDATION_ERROR",
      });
    }
    req.body = result.data; // Replace with parsed/sanitized data
    next();
  };
}

/**
 * Creates a middleware that validates req.query against a Zod schema.
 * @param {z.ZodSchema} schema
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return sendError(res, {
        message: "Parameter query tidak valid",
        statusCode: 400,
        errors,
        code: "VALIDATION_ERROR",
      });
    }
    req.query = result.data;
    next();
  };
}

/**
 * Creates a middleware that validates req.params against a Zod schema.
 * @param {z.ZodSchema} schema
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return sendError(res, {
        message: "Parameter tidak valid",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    req.params = result.data;
    next();
  };
}
