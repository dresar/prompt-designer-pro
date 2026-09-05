// backend/routes/system.routes.js

import { Router } from "express";
import * as ctrl from "../controllers/system.controller.js";

const router = Router();

router.get("/info", ctrl.getInfo);
router.get("/status", ctrl.getStatus);
router.get("/version", ctrl.getVersion);

export default router;
