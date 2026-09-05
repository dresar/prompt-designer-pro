// backend/middleware/admin.middleware.js
// Admin role enforcement — must be used AFTER requireAuth

import { Forbidden } from "../utils/response.js";

/**
 * Require admin role.
 * Must be used after requireAuth middleware.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) return next(Forbidden("Autentikasi diperlukan"));
  if (req.user.role !== "admin") {
    return next(Forbidden("Hanya admin yang dapat mengakses endpoint ini"));
  }
  next();
}
