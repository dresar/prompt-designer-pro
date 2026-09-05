// backend/routes/prompt.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/prompt.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.middleware.js";
import { generatePromptSchema, addFavoriteSchema } from "../utils/validators/prompt.validator.js";

const router = Router();

// All prompt routes require authentication
router.use(requireAuth);

// Generate
router.post("/generate", aiLimiter, validateBody(generatePromptSchema), ctrl.generatePrompt);

// History
router.get("/history", ctrl.getHistory);
router.get("/history/export", ctrl.exportHistory);
router.get("/history/:id", ctrl.getHistoryItem);
router.delete("/history/:id", ctrl.deleteHistoryItem);

// Favorites
router.get("/favorites", ctrl.getFavorites);
router.post("/favorites", validateBody(addFavoriteSchema), ctrl.addFavorite);
router.delete("/favorites/:id", ctrl.removeFavorite);

export default router;
