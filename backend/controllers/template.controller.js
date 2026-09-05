// backend/controllers/template.controller.js

import templateService from "../services/template.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";

export async function listTemplates(req, res, next) {
  try {
    const { items, total, page, limit } = await templateService.list(req);
    sendPaginated(res, { data: items, total, page, limit });
  } catch (err) { next(err); }
}

export async function getTemplate(req, res, next) {
  try {
    const template = await templateService.getOne(req.params.slug);
    sendSuccess(res, { data: template });
  } catch (err) { next(err); }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await templateService.getCategories();
    sendSuccess(res, { data: categories });
  } catch (err) { next(err); }
}
