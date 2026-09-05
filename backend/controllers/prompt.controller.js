// backend/controllers/prompt.controller.js

import promptService from "../services/prompt.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";

export async function generatePrompt(req, res, next) {
  try {
    const result = await promptService.generate(req.body, req.user);
    sendSuccess(res, {
      data: result,
      message: result.isDummy
        ? "Prompt dibuat (mode lokal — tambahkan API Key untuk menggunakan AI)"
        : `Prompt berhasil dibuat menggunakan ${result.provider}`,
    });
  } catch (err) { next(err); }
}

export async function getHistory(req, res, next) {
  try {
    const { items, total, page, limit } = await promptService.getHistory(req, req.user.id);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function getHistoryItem(req, res, next) {
  try {
    const item = await promptService.getHistoryItem(req.params.id, req.user.id);
    sendSuccess(res, { data: item });
  } catch (err) { next(err); }
}

export async function deleteHistoryItem(req, res, next) {
  try {
    await promptService.deleteHistoryItem(req.params.id, req.user.id);
    sendSuccess(res, { message: "Riwayat berhasil dihapus" });
  } catch (err) { next(err); }
}

export async function getFavorites(req, res, next) {
  try {
    const { items, total, page, limit } = await promptService.getFavorites(req.user.id, req);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function addFavorite(req, res, next) {
  try {
    const fav = await promptService.addFavorite(req.user.id, req.body.promptHistoryId);
    sendSuccess(res, { data: fav, message: "Ditambahkan ke favorit", statusCode: 201 });
  } catch (err) { next(err); }
}

export async function removeFavorite(req, res, next) {
  try {
    await promptService.removeFavorite(req.user.id, req.params.id);
    sendSuccess(res, { message: "Dihapus dari favorit" });
  } catch (err) { next(err); }
}

export async function exportHistory(req, res, next) {
  try {
    const data = await promptService.exportHistory(req.user.id);
    res.setHeader("Content-Disposition", `attachment; filename="promptstudio-history-${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));
  } catch (err) { next(err); }
}
