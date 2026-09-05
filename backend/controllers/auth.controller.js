// backend/controllers/auth.controller.js

import authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({ name, email, password });
    res.cookie("refresh_token", refreshToken, COOKIE_OPTS);
    sendSuccess(res, {
      data: { user, accessToken },
      message: "Registrasi berhasil",
      statusCode: 201,
    });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"];
    const ua = req.headers["user-agent"];
    const { user, accessToken, refreshToken } = await authService.login({ email, password, ipAddress: ip, userAgent: ua });
    res.cookie("refresh_token", refreshToken, COOKIE_OPTS);
    sendSuccess(res, {
      data: { user, accessToken },
      message: "Login berhasil",
    });
  } catch (err) { next(err); }
}

export async function loginDemo(req, res, next) {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"];
    const ua = req.headers["user-agent"];
    const { user, accessToken, refreshToken } = await authService.loginDemo({ ipAddress: ip, userAgent: ua });
    res.cookie("refresh_token", refreshToken, COOKIE_OPTS);
    sendSuccess(res, {
      data: { user, accessToken },
      message: "Demo login berhasil",
    });
  } catch (err) { next(err); }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token diperlukan" });
    }
    const { user, accessToken, refreshToken: newRefresh } = await authService.refreshToken(token);
    res.cookie("refresh_token", newRefresh, COOKIE_OPTS);
    sendSuccess(res, { data: { user, accessToken }, message: "Token diperbarui" });
  } catch (err) { next(err); }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    await authService.logout(token, req.user?.id);
    res.clearCookie("refresh_token", { path: "/" });
    sendSuccess(res, { message: "Logout berhasil" });
  } catch (err) { next(err); }
}

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, { message: "Jika email terdaftar, link reset password akan dikirim." });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    await authService.changePassword({ userId: req.user.id, ...req.body });
    res.clearCookie("refresh_token", { path: "/" });
    sendSuccess(res, { message: "Password berhasil diubah. Silakan login kembali." });
  } catch (err) { next(err); }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile({ userId: req.user.id, ...req.body });
    sendSuccess(res, { data: user, message: "Profil berhasil diperbarui" });
  } catch (err) { next(err); }
}
