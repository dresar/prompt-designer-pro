// backend/controllers/health.controller.js
// Health check — returns full system status

import { sendSuccess } from "../utils/response.js";
import prisma from "../lib/prisma.js";
import aiEngineService from "../services/aiEngine.service.js";
import cacheService from "../services/cache.service.js";
import config from "../config/index.js";
import os from "os";

export async function healthCheck(req, res, next) {
  try {
    const startTime = Date.now();

    // DB check
    let dbStatus = "ok";
    let dbLatencyMs = null;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = "error";
    }

    // AI provider check
    let aiProviders = {};
    try {
      aiProviders = await aiEngineService.checkProviderHealth();
    } catch {
      aiProviders = { error: "Failed to check" };
    }

    // Cache check
    let cacheStatus = "ok";
    try {
      await cacheService.set("__health", "1", 5);
      const val = await cacheService.get("__health");
      cacheStatus = val === "1" ? "ok" : "degraded";
    } catch {
      cacheStatus = "error";
    }

    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const data = {
      status: dbStatus === "ok" ? "healthy" : "degraded",
      version: config.app.version,
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: {
        process: Math.floor(process.uptime()),
        os: Math.floor(os.uptime()),
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      ai: aiProviders,
      cache: { status: cacheStatus, type: cacheService.useRedis ? "redis" : "memory" },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        freeSystem: Math.round(freeMem / 1024 / 1024),
        totalSystem: Math.round(totalMem / 1024 / 1024),
        unit: "MB",
      },
      responseMs: Date.now() - startTime,
    };

    const statusCode = data.status === "healthy" ? 200 : 503;
    res.status(statusCode).json({ success: true, message: "Health check", data, timestamp: data.timestamp });
  } catch (err) {
    next(err);
  }
}
