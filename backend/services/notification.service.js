// backend/services/notification.service.js
// User notification management

import prisma from "../lib/prisma.js";
import { NotFound, Forbidden } from "../utils/response.js";

class NotificationService {
  /**
   * Get notifications for a user
   */
  async getForUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { items, total, unreadCount, page, limit };
  }

  /**
   * Mark a notification as read
   */
  async markRead(id, userId) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) throw NotFound("Notifikasi tidak ditemukan");
    if (notif.userId !== userId) throw Forbidden("Akses ditolak");

    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(userId) {
    const { count } = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return count;
  }

  /**
   * Create a notification for one user
   */
  async create({ userId, title, body, type = "info", metadata = null }) {
    return prisma.notification.create({
      data: { userId, title, body, type, metadata },
    });
  }

  /**
   * Broadcast a notification to all active users (or by plan)
   * @param {{ title, body, type, plan? }} data
   */
  async broadcast({ title, body, type = "info", plan }) {
    const where = { isActive: true, deletedAt: null };
    if (plan) where.plan = plan;

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title, body, type })),
    });

    return users.length;
  }
}

const notificationService = new NotificationService();
export default notificationService;
