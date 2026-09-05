// backend/services/cache.service.js
// Cache abstraction: Redis primary, in-memory fallback
// Usage: cacheService.get(key), cacheService.set(key, value, ttlSeconds), cacheService.del(key)

import NodeCache from "node-cache";
import config from "../config/index.js";
import logger from "../utils/logger.js";

class CacheService {
  constructor() {
    this.memCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
    this.redisClient = null;
    this.useRedis = false;
    this._init();
  }

  async _init() {
    if (!config.redis.enabled) {
      logger.info("Cache: Using in-memory cache (Redis not configured)");
      return;
    }

    try {
      const { default: Redis } = await import("ioredis");
      this.redisClient = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        lazyConnect: true,
      });

      await this.redisClient.connect();
      this.useRedis = true;
      logger.info("Cache: Redis connected");

      this.redisClient.on("error", (err) => {
        logger.warn("Cache: Redis error, falling back to memory", { error: err.message });
        this.useRedis = false;
      });

      this.redisClient.on("reconnecting", () => {
        logger.info("Cache: Redis reconnecting...");
      });
    } catch (err) {
      logger.warn("Cache: Redis unavailable, using in-memory fallback", { error: err.message });
      this.useRedis = false;
    }
  }

  /**
   * Get a cached value
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      }
      const val = this.memCache.get(key);
      return val !== undefined ? val : null;
    } catch {
      return null;
    }
  }

  /**
   * Set a cached value
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Default 300s
   */
  async set(key, value, ttlSeconds = 300) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setex(key, ttlSeconds, JSON.stringify(value));
        return;
      }
      this.memCache.set(key, value, ttlSeconds);
    } catch {
      // Silent fail — cache misses are not critical
    }
  }

  /**
   * Delete a cached value
   * @param {string} key
   */
  async del(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
        return;
      }
      this.memCache.del(key);
    } catch {}
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern
   */
  async delPattern(pattern) {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length) await this.redisClient.del(...keys);
        return;
      }
      // In-memory: delete keys matching prefix
      const prefix = pattern.replace("*", "");
      const keys = this.memCache.keys().filter((k) => k.startsWith(prefix));
      this.memCache.del(keys);
    } catch {}
  }

  /**
   * Get or set cache — fetch from source if not cached
   * @param {string} key
   * @param {Function} fetcher - Async function returning data
   * @param {number} ttlSeconds
   */
  async getOrSet(key, fetcher, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /** Flush all cache */
  async flush() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushdb();
        return;
      }
      this.memCache.flushAll();
    } catch {}
  }
}

// Singleton
const cacheService = new CacheService();
export default cacheService;
