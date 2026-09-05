// backend/controllers/admin.controller.js
// Admin Panel API — dashboard, user management, template CRUD, API keys, announcements, banners, settings

import prisma from "../lib/prisma.js";
import templateService from "../services/template.service.js";
import apiKeyService from "../services/apiKey.service.js";
import settingsService from "../services/settings.service.js";
import activityService from "../services/activity.service.js";
import notificationService from "../services/notification.service.js";
import cacheService from "../services/cache.service.js";
import bcrypt from "bcrypt";
import config from "../config/index.js";
import { sendSuccess, sendPaginated, NotFound, BadRequest } from "../utils/response.js";
import { parsePaginationParams, buildOrderBy, buildSearchWhere } from "../utils/pagination.js";

// ─── Dashboard ─────────────────────────────────────────────────────────────

export async function getDashboard(req, res, next) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalPrompts, totalTemplates, totalCategories,
      loginsToday, newUsersToday, promptsToday, activeUsers7d,
      totalApiKeys, erroredApiKeys, totalApiRequests, requestsToday,
      geminiStats, groqStats, systemLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.promptHistory.count(),
      prisma.promptTemplate.count({ where: { deletedAt: null, isActive: true } }),
      prisma.promptCategory.count({ where: { isActive: true } }),
      prisma.activityLog.count({ where: { action: "LOGIN", createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.promptHistory.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: weekAgo }, isActive: true } }),
      prisma.apiKey.count({ where: { isActive: true, deletedAt: null } }),
      prisma.apiKey.count({ where: { errorCount: { gt: 0 }, isActive: true } }),
      prisma.apiUsageLog.count(),
      prisma.apiUsageLog.count({ where: { createdAt: { gte: today } } }),
      prisma.apiUsageLog.aggregate({ _sum: { tokensUsed: true, requestMs: true }, _count: true, where: { provider: { slug: "gemini" } } }),
      prisma.apiUsageLog.aggregate({ _sum: { tokensUsed: true }, _count: true, where: { provider: { slug: "groq" } } }),
      prisma.systemLog.count({ where: { level: "error", createdAt: { gte: today } } }),
    ]);

    // Prompt activity last 7 days
    const promptsPerDay = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM prompt_histories
      WHERE "createdAt" >= ${weekAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    sendSuccess(res, {
      data: {
        overview: {
          totalUsers, totalPrompts, totalTemplates, totalCategories,
          loginsToday, newUsersToday, promptsToday, activeUsers7d,
          totalApiKeys, erroredApiKeys, totalApiRequests, requestsToday,
          systemErrors: systemLogs,
        },
        ai: {
          gemini: { requests: geminiStats._count, tokens: geminiStats._sum.tokensUsed || 0, avgMs: Math.round((geminiStats._sum.requestMs || 0) / (geminiStats._count || 1)) },
          groq: { requests: groqStats._count, tokens: groqStats._sum.tokensUsed || 0 },
        },
        charts: { promptsPerDay },
      },
    });
  } catch (err) { next(err); }
}

// ─── User Management ───────────────────────────────────────────────────────

export async function listUsers(req, res, next) {
  try {
    const { page, limit, skip, sortBy, sortOrder, search } = parsePaginationParams(req, { limit: 20 });
    const { role, plan, isActive } = req.query;

    const where = { deletedAt: null };
    if (role) where.role = role;
    if (plan) where.plan = plan;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (search) {
      const s = buildSearchWhere(search, ["name", "email"]);
      where.OR = s.OR;
    }

    const allowedSort = ["createdAt", "name", "email", "lastLoginAt", "loginCount"];
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, plan: true, isActive: true, avatar: true, lastLoginAt: true, loginCount: true, createdAt: true, _count: { select: { promptHistories: true } } },
        orderBy: buildOrderBy(sortBy, sortOrder, allowedSort),
        skip, take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function getUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, plan: true, isActive: true, avatar: true, bio: true,
        lastLoginAt: true, loginCount: true, createdAt: true, deletedAt: true,
        subscription: true,
        _count: { select: { promptHistories: true, favorites: true } },
      },
    });
    if (!user) throw NotFound("User tidak ditemukan");
    sendSuccess(res, { data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, plan, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (plan !== undefined) { updateData.plan = plan; }
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, plan: true, isActive: true },
    });

    if (plan !== undefined) {
      await prisma.subscription.upsert({
        where: { userId: id },
        update: { plan, isActive: true },
        create: { userId: id, plan, isActive: true },
      });
    }

    await activityService.log({ userId: req.user.id, action: "UPDATE_USER", entity: "user", entityId: id, meta: req.body });
    sendSuccess(res, { data: user, message: "User berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user.id) throw BadRequest("Tidak dapat menghapus akun sendiri");

    await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await activityService.log({ userId: req.user.id, action: "DELETE_USER", entity: "user", entityId: id });
    sendSuccess(res, { message: "User berhasil dihapus" });
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, plan } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw BadRequest("Email sudah digunakan");

    const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds || 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        plan,
        subscription: { create: { plan, isActive: true } }
      },
      select: { id: true, name: true, email: true, role: true, plan: true, isActive: true }
    });

    await activityService.log({ userId: req.user.id, action: "CREATE_USER", entity: "user", entityId: user.id });
    sendSuccess(res, { data: user, message: "User berhasil dibuat", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptSaltRounds || 10);
    
    await prisma.user.update({
      where: { id },
      data: { password: passwordHash }
    });

    await activityService.log({ userId: req.user.id, action: "RESET_USER_PASSWORD", entity: "user", entityId: id });
    sendSuccess(res, { message: "Password user berhasil direset" });
  } catch (err) { next(err); }
}

export async function restoreUser(req, res, next) {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { deletedAt: null, isActive: true } });
    sendSuccess(res, { message: "User berhasil dipulihkan" });
  } catch (err) { next(err); }
}



// ─── Admin Template CRUD ───────────────────────────────────────────────────

export async function adminListTemplates(req, res, next) {
  try {
    const { items, total, page, limit } = await templateService.list(req, true);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function adminGetTemplate(req, res, next) {
  try {
    const template = await templateService.getOne(req.params.id);
    sendSuccess(res, { data: template });
  } catch (err) { next(err); }
}

export async function adminCreateTemplate(req, res, next) {
  try {
    const template = await templateService.create(req.body, req.user.id);
    await activityService.log({ userId: req.user.id, action: "CREATE_TEMPLATE", entity: "template", entityId: template.id });
    sendSuccess(res, { data: template, message: "Template berhasil dibuat", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function adminUpdateTemplate(req, res, next) {
  try {
    const template = await templateService.update(req.params.id, req.body, req.user.id);
    await activityService.log({ userId: req.user.id, action: "UPDATE_TEMPLATE", entity: "template", entityId: req.params.id });
    sendSuccess(res, { data: template, message: "Template berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function adminDeleteTemplate(req, res, next) {
  try {
    await templateService.delete(req.params.id);
    await activityService.log({ userId: req.user.id, action: "DELETE_TEMPLATE", entity: "template", entityId: req.params.id });
    sendSuccess(res, { message: "Template berhasil dihapus" });
  } catch (err) { next(err); }
}

export async function adminCloneTemplate(req, res, next) {
  try {
    const cloned = await templateService.clone(req.params.id, req.user.id);
    sendSuccess(res, { data: cloned, message: "Template berhasil diduplikasi", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function adminGetTemplateVersions(req, res, next) {
  try {
    const versions = await templateService.getVersions(req.params.id);
    sendSuccess(res, { data: versions });
  } catch (err) { next(err); }
}

export async function adminRestoreTemplateVersion(req, res, next) {
  try {
    const restored = await templateService.restoreVersion(req.params.id, req.params.version, req.user.id);
    sendSuccess(res, { data: restored, message: `Template dipulihkan ke versi ${req.params.version}` });
  } catch (err) { next(err); }
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function adminListCategories(req, res, next) {
  try {
    const categories = await prisma.promptCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    sendSuccess(res, { data: categories });
  } catch (err) { next(err); }
}

export async function adminGetCategory(req, res, next) {
  try {
    const category = await prisma.promptCategory.findUnique({
      where: { id: req.params.id },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    sendSuccess(res, { data: category });
  } catch (err) { next(err); }
}

export async function adminCreateCategory(req, res, next) {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    const cat = await prisma.promptCategory.create({ data });
    await cacheService.delPattern("categories:*");
    sendSuccess(res, { data: cat, message: "Kategori berhasil dibuat", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function adminUpdateCategory(req, res, next) {
  try {
    const cat = await prisma.promptCategory.update({ where: { id: req.params.id }, data: req.body });
    await cacheService.delPattern("categories:*");
    sendSuccess(res, { data: cat, message: "Kategori berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    await prisma.promptCategory.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), isActive: false } });
    await cacheService.delPattern("categories:*");
    sendSuccess(res, { message: "Kategori berhasil dihapus" });
  } catch (err) { next(err); }
}

// ─── API Keys ──────────────────────────────────────────────────────────────

export async function listProviders(req, res, next) {
  try {
    const providers = await prisma.apiProvider.findMany({ orderBy: { priority: "asc" } });
    sendSuccess(res, { data: providers });
  } catch (err) { next(err); }
}

export async function listApiKeys(req, res, next) {
  try {
    const { providerId } = req.query;
    const where = { deletedAt: null };
    if (providerId) where.providerId = providerId;
    const keys = await prisma.apiKey.findMany({
      where,
      select: { id: true, label: true, isActive: true, lastUsedAt: true, requestCount: true, errorCount: true, lastError: true, lastRotatedAt: true, models: true, createdAt: true, provider: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, { data: keys });
  } catch (err) { next(err); }
}

export async function createApiKey(req, res, next) {
  try {
    const key = await apiKeyService.createKey(req.body);
    await activityService.log({ userId: req.user.id, action: "CREATE_API_KEY", entity: "apiKey", entityId: key.id, meta: { label: key.label } });
    const { encryptedKey, ...safeKey } = key;
    sendSuccess(res, { data: safeKey, message: "API Key berhasil ditambahkan", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function updateApiKey(req, res, next) {
  try {
    const key = await apiKeyService.updateKey(req.params.id, req.body);
    const { encryptedKey, ...safeKey } = key;
    sendSuccess(res, { data: safeKey, message: "API Key berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function toggleApiKey(req, res, next) {
  try {
    const { isActive } = req.body;
    await apiKeyService.toggleKey(req.params.id, isActive);
    sendSuccess(res, { message: `API Key ${isActive ? "diaktifkan" : "dinonaktifkan"}` });
  } catch (err) { next(err); }
}

export async function deleteApiKey(req, res, next) {
  try {
    await apiKeyService.deleteKey(req.params.id);
    await activityService.log({ userId: req.user.id, action: "DELETE_API_KEY", entity: "apiKey", entityId: req.params.id });
    sendSuccess(res, { message: "API Key berhasil dihapus" });
  } catch (err) { next(err); }
}

export async function testApiKey(req, res, next) {
  try {
    const { id } = req.params;
    const key = await prisma.apiKey.findUnique({ 
      where: { id },
      include: { provider: true }
    });
    if (!key) throw NotFound("API Key tidak ditemukan");
    
    // Import aiEngineService directly here to avoid circular dependency issues at top level
    const aiEngineService = (await import("../services/aiEngine.service.js")).default;
    
    const result = await aiEngineService._tryProvider(
      key.provider.slug,
      "You are a helpful AI. Respond with 'OK'.",
      "Test connection",
      { userId: req.user.id }
    );
    
    if (result.success) {
      // Clear error count on success
      await prisma.apiKey.update({ where: { id }, data: { errorCount: 0, lastError: null } });
      sendSuccess(res, { message: "API Key valid dan berfungsi!" });
    } else {
      const errMsg = result.error?.message || "Unknown error";
      await apiKeyService.recordError(id, errMsg);
      throw BadRequest(`API Key bermasalah: ${errMsg}`);
    }
  } catch (err) { next(err); }
}

// ─── Announcements ─────────────────────────────────────────────────────────

export async function listAnnouncements(req, res, next) {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" }, skip, take: limit }),
      prisma.announcement.count({ where: { deletedAt: null } }),
    ]);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function createAnnouncement(req, res, next) {
  try {
    const ann = await prisma.announcement.create({ data: req.body });
    sendSuccess(res, { data: ann, message: "Pengumuman berhasil dibuat", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function updateAnnouncement(req, res, next) {
  try {
    const ann = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, { data: ann, message: "Pengumuman berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function deleteAnnouncement(req, res, next) {
  try {
    await prisma.announcement.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    sendSuccess(res, { message: "Pengumuman berhasil dihapus" });
  } catch (err) { next(err); }
}

// ─── Banners ───────────────────────────────────────────────────────────────

export async function listBanners(req, res, next) {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const [items, total] = await Promise.all([
      prisma.banner.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" }, skip, take: limit }),
      prisma.banner.count({ where: { deletedAt: null } }),
    ]);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function createBanner(req, res, next) {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    sendSuccess(res, { data: banner, message: "Banner berhasil dibuat", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function updateBanner(req, res, next) {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, { data: banner, message: "Banner berhasil diperbarui" });
  } catch (err) { next(err); }
}

export async function deleteBanner(req, res, next) {
  try {
    await prisma.banner.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    sendSuccess(res, { message: "Banner berhasil dihapus" });
  } catch (err) { next(err); }
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function getSettings(req, res, next) {
  try {
    const settings = await prisma.settings.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
    sendSuccess(res, { data: settings });
  } catch (err) { next(err); }
}

export async function updateSettings(req, res, next) {
  try {
    const updates = req.body;
    await settingsService.update(updates);
    await activityService.log({ userId: req.user.id, action: "UPDATE_SETTINGS", meta: { keys: Object.keys(updates) } });
    sendSuccess(res, { message: "Pengaturan berhasil diperbarui" });
  } catch (err) { next(err); }
}

// ─── Activity & System Logs ────────────────────────────────────────────────

export async function getActivityLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePaginationParams(req, { limit: 50 });
    const { action, userId } = req.query;
    const { logs, total } = await activityService.getLogs({ page, limit, skip, action, userId });
    sendPaginated(res, { data: logs, total, page, limit });
  } catch (err) { next(err); }
}

export async function getSystemLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePaginationParams(req, { limit: 50 });
    const { level } = req.query;
    const where = level ? { level } : {};
    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.systemLog.count({ where }),
    ]);
    sendPaginated(res, { data: logs, total, page, limit });
  } catch (err) { next(err); }
}

export async function getApiUsageLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePaginationParams(req, { limit: 50 });
    const { providerId, success } = req.query;
    const where = {};
    if (providerId) where.providerId = providerId;
    if (success !== undefined) where.success = success === "true";

    const [logs, total] = await Promise.all([
      prisma.apiUsageLog.findMany({
        where,
        include: {
          provider: { select: { name: true, slug: true } },
          apiKey: { select: { label: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip, take: limit,
      }),
      prisma.apiUsageLog.count({ where }),
    ]);
    sendPaginated(res, { data: logs, total, page, limit });
  } catch (err) { next(err); }
}

export async function adminGetPromptHistory(req, res, next) {
  try {
    const { items, total, page, limit } = await (await import("../services/prompt.service.js")).default.getHistory(req, null, true);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

// ─── Backup / Export ───────────────────────────────────────────────────────

export async function exportConfig(req, res, next) {
  try {
    const [settingsData, categories, providers] = await Promise.all([
      settingsService.export(),
      prisma.promptCategory.findMany({ where: { deletedAt: null } }),
      prisma.apiProvider.findMany(),
    ]);

    const templates = await prisma.promptTemplate.findMany({
      where: { deletedAt: null },
      include: { category: { select: { slug: true } } },
    });

    const announcements = await prisma.announcement.findMany({ where: { deletedAt: null } });
    const banners = await prisma.banner.findMany({ where: { deletedAt: null } });

    const backup = {
      exportedAt: new Date().toISOString(),
      version: config.app.version,
      data: {
        settings: settingsData.settings,
        categories,
        providers,
        templates: templates.map(({ id, createdAt, updatedAt, usageCount, version, ...t }) => t),
        announcements,
        banners,
      },
      note: "API keys are NOT included in backup for security reasons",
    };

    res.setHeader("Content-Disposition", `attachment; filename="promptstudio-backup-${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) { next(err); }
}

export async function importConfig(req, res, next) {
  try {
    const { data } = req.body;
    if (!data) throw BadRequest("Data backup diperlukan");

    let imported = { settings: 0, categories: 0, templates: 0 };

    if (data.settings?.length) {
      imported.settings = await settingsService.import(data.settings);
    }

    if (data.categories?.length) {
      for (const cat of data.categories) {
        await prisma.promptCategory.upsert({ where: { slug: cat.slug }, update: {}, create: { name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color, order: cat.order || 0, isActive: true } });
        imported.categories++;
      }
    }

    await activityService.log({ userId: req.user.id, action: "IMPORT_CONFIG", meta: imported });
    sendSuccess(res, { data: imported, message: "Konfigurasi berhasil diimpor" });
  } catch (err) { next(err); }
}

// ─── Notifications (Admin) ─────────────────────────────────────────────────

export async function broadcastNotification(req, res, next) {
  try {
    const { title, body, type, plan } = req.body;
    const count = await notificationService.broadcast({ title, body, type, plan });
    sendSuccess(res, { message: `Notifikasi dikirim ke ${count} pengguna` });
  } catch (err) { next(err); }
}
