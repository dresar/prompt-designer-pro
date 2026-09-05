// backend/routes/notification.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.getNotifications);
router.patch("/read-all", ctrl.markAllRead);
router.patch("/:id/read", ctrl.markRead);

export default router;
