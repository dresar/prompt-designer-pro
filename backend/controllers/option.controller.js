import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";

const prisma = new PrismaClient();

// Get options for admin (paginated or all)
export async function adminListOptions(req, res, next) {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = type ? { type } : {};
    
    const [items, total] = await Promise.all([
      prisma.generatorOption.findMany({
        where,
        orderBy: [{ type: "asc" }, { order: "asc" }],
        skip,
        take: Number(limit),
      }),
      prisma.generatorOption.count({ where }),
    ]);

    sendPaginated(res, { data: items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// Get single option
export async function getOption(req, res, next) {
  try {
    const { id } = req.params;
    const option = await prisma.generatorOption.findUnique({ where: { id } });
    if (!option) return sendError(res, { statusCode: 404, message: "Option not found" });
    sendSuccess(res, { data: option });
  } catch (err) {
    next(err);
  }
}

// Create option
export async function createOption(req, res, next) {
  try {
    const { type, label, value, isActive = true, order = 0 } = req.body;
    
    if (!type || !label || !value) {
      return sendError(res, { statusCode: 400, message: "Type, label, and value are required" });
    }

    const option = await prisma.generatorOption.create({
      data: { type, label, value, isActive, order: Number(order) },
    });

    sendSuccess(res, { statusCode: 201, data: option, message: "Option created" });
  } catch (err) {
    next(err);
  }
}

// Update option
export async function updateOption(req, res, next) {
  try {
    const { id } = req.params;
    const { type, label, value, isActive, order } = req.body;
    
    const option = await prisma.generatorOption.update({
      where: { id },
      data: { type, label, value, isActive, order: order !== undefined ? Number(order) : undefined },
    });

    sendSuccess(res, { data: option, message: "Option updated" });
  } catch (err) {
    next(err);
  }
}

// Delete option
export async function deleteOption(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.generatorOption.delete({ where: { id } });
    sendSuccess(res, { message: "Option deleted" });
  } catch (err) {
    next(err);
  }
}

// Get grouped options for the generator frontend (public/auth)
export async function getGeneratorOptions(req, res, next) {
  try {
    const options = await prisma.generatorOption.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    });

    // Group by type
    const grouped = options.reduce((acc, opt) => {
      if (!acc[opt.type]) acc[opt.type] = [];
      acc[opt.type].push({ label: opt.label, value: opt.value });
      return acc;
    }, {});

    sendSuccess(res, { data: grouped });
  } catch (err) {
    next(err);
  }
}
