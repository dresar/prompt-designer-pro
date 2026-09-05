import { Router } from "express";
import * as ctrl from "../controllers/option.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Public/Auth routes for frontend generator
router.get("/public", ctrl.getGeneratorOptions);

// Admin routes
router.use(requireAuth, requireAdmin);
router.get("/", ctrl.adminListOptions);
router.get("/:id", ctrl.getOption);
router.post("/", ctrl.createOption);
router.patch("/:id", ctrl.updateOption);
router.delete("/:id", ctrl.deleteOption);

export default router;
