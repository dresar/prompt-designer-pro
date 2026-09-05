// backend/routes/admin.routes.js
// All routes here require: requireAuth + requireAdmin

import { Router } from "express";
import * as ctrl from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createTemplateSchema, updateTemplateSchema,
  createCategorySchema, createApiKeySchema,
  updateUserSchema, createUserSchema, resetPasswordSchema,
  createAnnouncementSchema, createBannerSchema, updateSettingsSchema,
} from "../utils/validators/admin.validator.js";

const router = Router();

// Apply auth + admin guard to all routes
router.use(requireAuth, requireAdmin);

// Dashboard
router.get("/dashboard", ctrl.getDashboard);

// Users
router.get("/users", ctrl.listUsers);
router.get("/users/:id", ctrl.getUser);
router.post("/users", validateBody(createUserSchema), ctrl.createUser);
router.patch("/users/:id", validateBody(updateUserSchema), ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);
router.patch("/users/:id/restore", ctrl.restoreUser);
router.post("/users/:id/reset-password", validateBody(resetPasswordSchema), ctrl.resetUserPassword);
router.patch("/users/:id/subscription", ctrl.updateUser); // reuse updateUser

// Templates
router.get("/templates", ctrl.adminListTemplates);
router.get("/templates/:id", ctrl.adminGetTemplate);
router.post("/templates", validateBody(createTemplateSchema), ctrl.adminCreateTemplate);
router.patch("/templates/:id", validateBody(updateTemplateSchema), ctrl.adminUpdateTemplate);
router.delete("/templates/:id", ctrl.adminDeleteTemplate);
router.post("/templates/:id/clone", ctrl.adminCloneTemplate);
router.get("/templates/:id/versions", ctrl.adminGetTemplateVersions);
router.post("/templates/:id/restore/:version", ctrl.adminRestoreTemplateVersion);

// Categories
router.get("/categories", ctrl.adminListCategories);
router.get("/categories/:id", ctrl.adminGetCategory);
router.post("/categories", validateBody(createCategorySchema), ctrl.adminCreateCategory);
router.patch("/categories/:id", ctrl.adminUpdateCategory);
router.delete("/categories/:id", ctrl.adminDeleteCategory);

// API Keys & Providers
router.get("/providers", ctrl.listProviders);
router.get("/api-keys", ctrl.listApiKeys);
router.post("/api-keys", validateBody(createApiKeySchema), ctrl.createApiKey);
router.patch("/api-keys/:id", ctrl.updateApiKey);
router.patch("/api-keys/:id/toggle", ctrl.toggleApiKey);
router.post("/api-keys/:id/test", ctrl.testApiKey);
router.delete("/api-keys/:id", ctrl.deleteApiKey);

// Announcements
router.get("/announcements", ctrl.listAnnouncements);
router.post("/announcements", validateBody(createAnnouncementSchema), ctrl.createAnnouncement);
router.patch("/announcements/:id", ctrl.updateAnnouncement);
router.delete("/announcements/:id", ctrl.deleteAnnouncement);

// Banners
router.get("/banners", ctrl.listBanners);
router.post("/banners", validateBody(createBannerSchema), ctrl.createBanner);
router.patch("/banners/:id", ctrl.updateBanner);
router.delete("/banners/:id", ctrl.deleteBanner);

// Settings
router.get("/settings", ctrl.getSettings);
router.patch("/settings", validateBody(updateSettingsSchema), ctrl.updateSettings);

// Logs
router.get("/activity-logs", ctrl.getActivityLogs);
router.get("/system-logs", ctrl.getSystemLogs);
router.get("/api-usage", ctrl.getApiUsageLogs);
router.get("/prompts", ctrl.adminGetPromptHistory);

// Notifications broadcast
router.post("/notifications/broadcast", ctrl.broadcastNotification);

// Backup
router.get("/backup/export", ctrl.exportConfig);
router.post("/backup/import", ctrl.importConfig);

export default router;
