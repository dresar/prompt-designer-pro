// backend/utils/validators/admin.validator.js

import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().max(1000).optional(),
  categoryId: z.string().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  contentType: z.string().min(1).max(100),
  slides: z.number().int().min(1).max(50).default(5),
  style: z.string().min(1).max(100),
  audience: z.string().min(1).max(100),
  language: z.enum(["id", "en"]).default("id"),
  output: z.enum(["prompt", "prompt+caption", "prompt+json"]).default("prompt"),
  globalPrompt: z.string().max(5000).optional(),
  slidePrompts: z.any().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  order: z.number().int().default(0),
});

export const createApiKeySchema = z.object({
  providerId: z.string().min(2, "Provider ID tidak valid"),
  label: z.string().min(2).max(100),
  plainKey: z.string().min(10, "API key terlalu pendek"),
  models: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["user", "admin"]).optional(),
  plan: z.enum(["Free", "Pro", "Demo"]).optional(),
  isActive: z.boolean().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  plan: z.enum(["Free", "Pro", "Demo"]).default("Free"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1).max(5000),
  type: z.enum(["info", "warning", "success", "danger"]).default("info"),
  isActive: z.boolean().default(true),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  order: z.number().int().default(0),
});

export const createBannerSchema = z.object({
  title: z.string().min(2).max(200),
  imageUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  position: z.enum(["dashboard", "landing", "header"]).default("dashboard"),
  isActive: z.boolean().default(true),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  order: z.number().int().default(0),
});

export const updateSettingsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
