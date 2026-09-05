// backend/services/auth.service.js
// Authentication business logic

import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { BadRequest, Unauthorized, Conflict, NotFound } from "../utils/response.js";
import config from "../config/index.js";
import activityService from "./activity.service.js";
import logger from "../utils/logger.js";

// Track login attempts (in-memory — use Redis in high-scale)
const loginAttempts = new Map();

function checkBruteForce(email) {
  const key = email.toLowerCase();
  const record = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  const elapsed = (Date.now() - record.firstAttempt) / 1000;

  // Reset window if lockout duration passed
  if (elapsed > config.security.lockoutDuration) {
    loginAttempts.delete(key);
    return;
  }

  if (record.count >= config.security.maxLoginAttempts) {
    const remaining = Math.ceil(config.security.lockoutDuration - elapsed);
    throw BadRequest(`Terlalu banyak percobaan login. Coba lagi dalam ${remaining} detik.`);
  }
}

function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  const record = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  record.count++;
  loginAttempts.set(key, record);
}

function clearFailedAttempts(email) {
  loginAttempts.delete(email.toLowerCase());
}

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    // Check registration enabled
    const regSetting = await prisma.settings.findUnique({ where: { key: "app.registrationEnabled" } });
    if (regSetting?.value === "false") {
      throw BadRequest("Registrasi pengguna saat ini ditutup.");
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw Conflict("Email sudah terdaftar");

    const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: "user",
        plan: "Free",
        isActive: true,
        subscription: {
          create: { plan: "Free", isActive: true },
        },
      },
      select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true },
    });

    await activityService.log({ userId: user.id, action: "REGISTER", entity: "user", entityId: user.id });

    const accessToken = signAccessToken(user);
    const refreshTokenStr = signRefreshToken({ id: user.id });

    await prisma.refreshToken.create({
      data: { token: refreshTokenStr, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { user, accessToken, refreshToken: refreshTokenStr };
  }

  /**
   * Login with email + password
   */
  async login({ email, password, ipAddress, userAgent }) {
    const normalizedEmail = email.toLowerCase();

    // Brute force check
    checkBruteForce(normalizedEmail);

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
    });

    if (!user) {
      recordFailedAttempt(normalizedEmail);
      throw Unauthorized("Email atau password salah");
    }

    if (!user.isActive) {
      throw Unauthorized("Akun Anda telah dinonaktifkan. Hubungi admin.");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      recordFailedAttempt(normalizedEmail);
      throw Unauthorized("Email atau password salah");
    }

    clearFailedAttempts(normalizedEmail);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });

    await activityService.log({
      userId: user.id,
      action: "LOGIN",
      entity: "user",
      entityId: user.id,
      meta: { email: user.email },
      ipAddress,
      userAgent,
    });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, avatar: user.avatar };
    const accessToken = signAccessToken(safeUser);
    const refreshTokenStr = signRefreshToken({ id: user.id });

    await prisma.refreshToken.create({
      data: { token: refreshTokenStr, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), ipAddress, userAgent },
    });

    return { user: safeUser, accessToken, refreshToken: refreshTokenStr };
  }

  /**
   * Demo login — uses hardcoded demo account
   */
  async loginDemo({ ipAddress, userAgent }) {
    return this.login({ email: "demo@promptstudio.ai", password: "123456", ipAddress, userAgent });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, email: true, role: true, plan: true, avatar: true, isActive: true, deletedAt: true } } },
    });

    if (!storedToken || storedToken.isRevoked) throw Unauthorized("Refresh token tidak valid");
    if (storedToken.expiresAt < new Date()) throw Unauthorized("Refresh token sudah kadaluarsa");
    if (!storedToken.user.isActive || storedToken.user.deletedAt) throw Unauthorized("Akun tidak aktif");

    // Revoke old token (token rotation)
    await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });

    const { user } = storedToken;
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken({ id: user.id });

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, avatar: user.avatar };
    return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — revoke refresh token
   */
  async logout(refreshToken, userId) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { isRevoked: true },
      });
    }
    if (userId) {
      await activityService.log({ userId, action: "LOGOUT", entity: "user", entityId: userId });
    }
  }

  /**
   * Change password
   */
  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw NotFound("User tidak ditemukan");

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) throw BadRequest("Password lama tidak sesuai");

    if (currentPassword === newPassword) throw BadRequest("Password baru tidak boleh sama dengan password lama");

    const newHash = await bcrypt.hash(newPassword, config.security.bcryptSaltRounds);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } });

    await activityService.log({ userId, action: "CHANGE_PASSWORD", entity: "user", entityId: userId });
  }

  /**
   * Update user profile
   */
  async updateProfile({ userId, name, avatar, bio }) {
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, plan: true, avatar: true, bio: true },
    });

    await activityService.log({ userId, action: "UPDATE_PROFILE", entity: "user", entityId: userId });
    return user;
  }

  /**
   * Forgot password — placeholder (returns success, email would be sent in production)
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to prevent email enumeration
    if (user) {
      logger.info(`Password reset requested for: ${email}`);
      await activityService.log({ userId: user.id, action: "FORGOT_PASSWORD", entity: "user", entityId: user.id });
    }
    return true;
  }

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true, plan: true,
        avatar: true, bio: true, lastLoginAt: true, loginCount: true,
        createdAt: true, updatedAt: true,
        subscription: { select: { plan: true, startsAt: true, expiresAt: true, isActive: true } },
        _count: { select: { promptHistories: true, favorites: true } },
      },
    });

    if (!user) throw NotFound("User tidak ditemukan");
    return user;
  }
}

const authService = new AuthService();
export default authService;
