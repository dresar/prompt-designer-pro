// backend/utils/jwt.js
// JWT helpers: sign access token, sign refresh token, verify tokens

import jwt from "jsonwebtoken";
import { Unauthorized } from "./response.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "promptstudio-access-secret-change-in-production";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "promptstudio-refresh-secret-change-in-production";
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Sign an access token
 * @param {{ id: string, email: string, role: string, plan: string }} payload
 * @returns {string}
 */
export function signAccessToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role, plan: payload.plan },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, issuer: "promptstudio.ai" }
  );
}

/**
 * Sign a refresh token
 * @param {{ id: string }} payload
 * @returns {string}
 */
export function signRefreshToken(payload) {
  return jwt.sign(
    { id: payload.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES, issuer: "promptstudio.ai" }
  );
}

/**
 * Verify an access token and return decoded payload
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, plan: string }}
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET, { issuer: "promptstudio.ai" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw Unauthorized("Token sudah kadaluarsa");
    }
    throw Unauthorized("Token tidak valid");
  }
}

/**
 * Verify a refresh token and return decoded payload
 * @param {string} token
 * @returns {{ id: string }}
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET, { issuer: "promptstudio.ai" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw Unauthorized("Refresh token sudah kadaluarsa, silakan login kembali");
    }
    throw Unauthorized("Refresh token tidak valid");
  }
}

/**
 * Extract token from Authorization header or cookie
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return null;
}
