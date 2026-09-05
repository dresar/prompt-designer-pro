// backend/routes/template.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/template.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, ctrl.listTemplates);
router.get("/categories", ctrl.listCategories);
router.get("/:slug", optionalAuth, ctrl.getTemplate);

export default router;
