// backend/services/settings.service.js
// Settings service with caching layer

import prisma from "../lib/prisma.js";
import cacheService from "./cache.service.js";
import logger from "../utils/logger.js";

const CACHE_KEY = "settings:all";
const PUBLIC_CACHE_KEY = "settings:public";
const CACHE_TTL = 300; // 5 minutes

class SettingsService {
  /**
   * Get all settings (admin only)
   * @returns {Promise<object>} key-value map
   */
  async getAll() {
    return cacheService.getOrSet(CACHE_KEY, async () => {
      const settings = await prisma.settings.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
      return this._toMap(settings);
    }, CACHE_TTL);
  }

  /**
   * Get public settings (for frontend)
   * @returns {Promise<object>}
   */
  async getPublic() {
    return cacheService.getOrSet(PUBLIC_CACHE_KEY, async () => {
      const settings = await prisma.settings.findMany({ where: { isPublic: true } });
      return this._toMap(settings);
    }, CACHE_TTL);
  }

  /**
   * Get a single setting value
   * @param {string} key
   * @param {any} defaultValue
   */
  async get(key, defaultValue = null) {
    const all = await this.getAll();
    return all[key] !== undefined ? all[key] : defaultValue;
  }

  /**
   * Update one or more settings
   * @param {Record<string, string>} updates
   */
  async update(updates) {
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.settings.update({
        where: { key },
        data: { value: String(value) },
      })
    );

    await Promise.all(ops);
    await this.invalidateCache();
    logger.info("Settings updated", { keys: Object.keys(updates) });
  }

  /**
   * Upsert a setting (create if not exists)
   * @param {object} setting
   */
  async upsert(setting) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    await this.invalidateCache();
  }

  /**
   * Get typed value (parses type from DB)
   * @param {string} key
   */
  async getTyped(key) {
    const setting = await prisma.settings.findUnique({ where: { key } });
    if (!setting) return null;
    return this._parseValue(setting.value, setting.type);
  }

  _parseValue(value, type) {
    switch (type) {
      case "number": return Number(value);
      case "boolean": return value === "true";
      case "json": try { return JSON.parse(value); } catch { return null; }
      default: return value;
    }
  }

  _toMap(settings) {
    return settings.reduce((acc, s) => {
      acc[s.key] = this._parseValue(s.value, s.type);
      return acc;
    }, {});
  }

  async invalidateCache() {
    await Promise.all([
      cacheService.del(CACHE_KEY),
      cacheService.del(PUBLIC_CACHE_KEY),
    ]);
  }

  /**
   * Export all settings to JSON (for backup)
   */
  async export() {
    const settings = await prisma.settings.findMany({ orderBy: { key: "asc" } });
    return { exportedAt: new Date().toISOString(), settings };
  }

  /**
   * Import settings from JSON backup
   * @param {Array} settings
   */
  async import(settings) {
    let count = 0;
    for (const s of settings) {
      if (!s.key || s.value === undefined) continue;
      await prisma.settings.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, type: s.type || "string", group: s.group || "general" },
      });
      count++;
    }
    await this.invalidateCache();
    return count;
  }
}

const settingsService = new SettingsService();
export default settingsService;
