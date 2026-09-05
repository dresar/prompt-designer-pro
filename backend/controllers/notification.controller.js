// backend/controllers/notification.controller.js

import notificationService from "../services/notification.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";

export async function getNotifications(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await notificationService.getForUser(req.user.id, { page, limit });
    sendPaginated(res, { data: result.items, total: result.total, page, limit,
      message: `${result.unreadCount} notifikasi belum dibaca` });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    const notif = await notificationService.markRead(req.params.id, req.user.id);
    sendSuccess(res, { data: notif, message: "Notifikasi ditandai sudah dibaca" });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    const count = await notificationService.markAllRead(req.user.id);
    sendSuccess(res, { message: `${count} notifikasi ditandai sudah dibaca` });
  } catch (err) { next(err); }
}
