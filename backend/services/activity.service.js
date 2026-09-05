// backend/services/activity.service.js
// Activity log service — records important user/system actions

import prisma from "../lib/prisma.js";
import logger from "../utils/logger.js";

class ActivityService {
  /**
   * Log an activity
   * @param {object} params
   * @param {string} [params.userId]
   * @param {string} params.action - e.g. LOGIN, LOGOUT, CREATE_TEMPLATE
   * @param {string} [params.entity] - e.g. user, template, apiKey
   * @param {string} [params.entityId]
   * @param {object} [params.meta]
   * @param {string} [params.ipAddress]
   * @param {string} [params.userAgent]
   */
  async log({ userId, action, entity, entityId, meta, ipAddress, userAgent } = {}) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: userId || null,
          action,
          entity: entity || null,
          entityId: entityId || null,
          meta: meta || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (err) {
      // Non-critical — don't disrupt main flow
      logger.error("Failed to write activity log", { error: err.message, action });
    }
  }

  /**
   * Get activity logs with pagination
   * @param {{ page: number, limit: number, userId?: string, action?: string }} params
   */
  async getLogs({ page = 1, limit = 50, userId, action, skip } = {}) {
    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: "insensitive" };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: skip ?? (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total };
  }
}

const activityService = new ActivityService();
export default activityService;
