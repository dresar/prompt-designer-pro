// backend/utils/validators/prompt.validator.js

import { z } from "zod";

export const generatePromptSchema = z.object({
  topic: z.string().min(1, "Topik diperlukan").max(300, "Topik terlalu panjang").trim(),
  contentType: z.string().min(1, "Jenis konten diperlukan").max(100),
  slides: z.number().int().min(1).max(20).default(5),
  style: z.string().min(1, "Gaya desain diperlukan").max(100),
  audience: z.string().min(1, "Target audiens diperlukan").max(100),
  language: z.enum(["id", "en"]).default("id"),
  output: z.enum(["prompt", "prompt+caption", "prompt+json"]).default("prompt"),
  globalPrompt: z.string().max(2000).optional(),
  provider: z.enum(["gemini", "groq", "auto"]).optional(),
});

export const addFavoriteSchema = z.object({
  promptHistoryId: z.string().cuid("ID tidak valid"),
});
