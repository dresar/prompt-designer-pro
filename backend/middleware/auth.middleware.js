// backend/middleware/auth.middleware.js
// JWT authentication middleware — attaches user to req.user

import { verifyAccessToken, extractToken } from "../utils/jwt.js";
import { Unauthorized } from "../utils/response.js";
import prisma from "../lib/prisma.js";

/**
 * Require a valid JWT access token.
 * Attaches decoded user to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw Unauthorized("Token autentikasi diperlukan");

    const decoded = verifyAccessToken(token);

    // Lightweight check — fetch user from DB to ensure not deleted/deactivated
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, isActive: true, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, plan: true, avatar: true },
    });

    if (!user) throw Unauthorized("Akun tidak ditemukan atau tidak aktif");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional auth — attaches user if token present, continues without error if not.
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findFirst({
        where: { id: decoded.id, isActive: true, deletedAt: null },
        select: { id: true, name: true, email: true, role: true, plan: true },
      });
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
}
