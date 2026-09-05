// backend/services/prompt.service.js
// Prompt generation, history management, and favorites

import prisma from "../lib/prisma.js";
import aiEngineService from "./aiEngine.service.js";
import promptBuilderService from "./promptBuilder.service.js";
import settingsService from "./settings.service.js";
import { BadRequest, NotFound, Forbidden, TooManyRequests } from "../utils/response.js";
import { parsePaginationParams, buildOrderBy } from "../utils/pagination.js";

class PromptService {
  /**
   * Generate a prompt via AI or local engine
   * @param {object} input
   * @param {object} user - { id, plan }
   * @param {object} req - Express request (for pagination)
   */
  async generate(input, user) {
    // Check daily quota
    await this._checkDailyQuota(user);

    // Generate via AI engine (with local fallback)
    const result = await aiEngineService.generate(input, { userId: user.id });

    // Determine caption and json from result or local build
    let caption, json;
    if (result.isDummy && input.output !== "prompt") {
      const local = promptBuilderService.buildLocal(input);
      caption = local.caption;
      json = local.json;
    } else if (result.caption) {
      caption = result.caption;
    } else if (result.json) {
      json = result.json;
    }

    // Save to history
    const history = await prisma.promptHistory.create({
      data: {
        userId: user.id,
        title: input.topic || "Untitled Prompt",
        contentType: input.contentType,
        style: input.style,
        audience: input.audience,
        language: input.language,
        slides: input.slides,
        output: input.output,
        promptText: result.text,
        captionText: caption || null,
        jsonData: json || null,
        provider: result.provider,
        tokensUsed: result.tokensUsed || null,
        responseMs: result.responseMs || null,
        isDummy: result.isDummy || false,
      },
    });

    return {
      prompt: result.text,
      caption,
      json: json ? (typeof json === "string" ? JSON.parse(json) : json) : undefined,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      isDummy: result.isDummy,
      historyId: history.id,
    };
  }

  /**
   * Check if user has exceeded daily prompt quota
   * @private
   */
  async _checkDailyQuota(user) {
    const planKeyMap = { Free: "prompt.maxDailyFree", Pro: "prompt.maxDailyPro", Demo: "prompt.maxDailyDemo" };
    const settingKey = planKeyMap[user.plan] || "prompt.maxDailyFree";
    const maxDaily = await settingsService.get(settingKey, 10);

    if (Number(maxDaily) < 0) return; // -1 = unlimited

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const count = await prisma.promptHistory.count({
      where: { userId: user.id, createdAt: { gte: todayStart } },
    });

    if (count >= Number(maxDaily)) {
      throw TooManyRequests(
        `Anda telah mencapai batas ${maxDaily} prompt hari ini untuk paket ${user.plan}. Upgrade ke Pro untuk limit lebih tinggi.`
      );
    }
  }

  /**
   * Get prompt history for a user (or all if admin)
   */
  async getHistory(req, userId, isAdmin = false) {
    const { page, limit, skip, sortBy, sortOrder, search } = parsePaginationParams(req, { limit: 20 });

    const where = {};
    if (!isAdmin) where.userId = userId;
    if (req.query.userId && isAdmin) where.userId = req.query.userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { contentType: { contains: search, mode: "insensitive" } },
      ];
    }

    const allowedSort = ["createdAt", "updatedAt", "title", "provider"];
    const orderBy = buildOrderBy(sortBy, sortOrder, allowedSort);

    const [items, total] = await Promise.all([
      prisma.promptHistory.findMany({
        where,
        select: {
          id: true, title: true, contentType: true, style: true, audience: true,
          language: true, slides: true, output: true, provider: true, tokensUsed: true,
          isDummy: true, createdAt: true,
          user: isAdmin ? { select: { id: true, name: true, email: true } } : false,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.promptHistory.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get a single history item
   */
  async getHistoryItem(id, userId, isAdmin = false) {
    const item = await prisma.promptHistory.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!item) throw NotFound("Riwayat prompt tidak ditemukan");
    if (!isAdmin && item.userId !== userId) throw Forbidden("Akses ditolak");

    return item;
  }

  /**
   * Delete a history item
   */
  async deleteHistoryItem(id, userId, isAdmin = false) {
    const item = await prisma.promptHistory.findUnique({ where: { id } });
    if (!item) throw NotFound("Riwayat prompt tidak ditemukan");
    if (!isAdmin && item.userId !== userId) throw Forbidden("Akses ditolak");
    await prisma.promptHistory.delete({ where: { id } });
  }

  /**
   * Get user's favorites
   */
  async getFavorites(userId, req) {
    const { page, limit, skip } = parsePaginationParams(req, { limit: 20 });

    const [items, total] = await Promise.all([
      prisma.favoritePrompt.findMany({
        where: { userId },
        include: {
          promptHistory: {
            select: {
              id: true, title: true, contentType: true, style: true,
              slides: true, provider: true, createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.favoritePrompt.count({ where: { userId } }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Add a prompt to favorites
   */
  async addFavorite(userId, promptHistoryId) {
    const history = await prisma.promptHistory.findUnique({ where: { id: promptHistoryId } });
    if (!history) throw NotFound("Riwayat prompt tidak ditemukan");
    if (history.userId !== userId) throw Forbidden("Akses ditolak");

    const existing = await prisma.favoritePrompt.findUnique({
      where: { userId_promptHistoryId: { userId, promptHistoryId } },
    });
    if (existing) throw BadRequest("Prompt sudah ada di favorit");

    return prisma.favoritePrompt.create({ data: { userId, promptHistoryId } });
  }

  /**
   * Remove a prompt from favorites
   */
  async removeFavorite(userId, favoriteId) {
    const fav = await prisma.favoritePrompt.findUnique({ where: { id: favoriteId } });
    if (!fav) throw NotFound("Favorit tidak ditemukan");
    if (fav.userId !== userId) throw Forbidden("Akses ditolak");
    await prisma.favoritePrompt.delete({ where: { id: favoriteId } });
  }

  /**
   * Export user's prompt history as JSON
   */
  async exportHistory(userId) {
    const items = await prisma.promptHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, contentType: true, style: true, audience: true,
        language: true, slides: true, output: true, promptText: true,
        captionText: true, provider: true, createdAt: true,
      },
    });
    return { exportedAt: new Date().toISOString(), count: items.length, items };
  }
}

const promptService = new PromptService();
export default promptService;
