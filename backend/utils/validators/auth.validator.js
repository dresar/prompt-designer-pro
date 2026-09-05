// backend/utils/validators/auth.validator.js
// Zod schemas for auth endpoints

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  email: z.string().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password terlalu panjang"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password diperlukan"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama diperlukan"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(500).optional().nullable(),
  avatar: z.string().url("URL avatar tidak valid").optional().nullable(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
