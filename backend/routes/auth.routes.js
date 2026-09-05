// backend/routes/auth.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  registerSchema, loginSchema, changePasswordSchema,
  forgotPasswordSchema, updateProfileSchema,
} from "../utils/validators/auth.validator.js";

const router = Router();

// Public routes (with auth rate limiter)
router.post("/register", authLimiter, validateBody(registerSchema), ctrl.register);
router.post("/login", authLimiter, validateBody(loginSchema), ctrl.login);
router.post("/demo", authLimiter, ctrl.loginDemo);
router.post("/refresh", ctrl.refreshToken);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), ctrl.forgotPassword);

// Protected routes
router.post("/logout", requireAuth, ctrl.logout);
router.get("/me", requireAuth, ctrl.getMe);
router.patch("/profile", requireAuth, validateBody(updateProfileSchema), ctrl.updateProfile);
router.post("/change-password", requireAuth, validateBody(changePasswordSchema), ctrl.changePassword);

export default router;
