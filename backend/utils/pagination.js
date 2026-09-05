// backend/utils/pagination.js
// Pagination helpers for all list endpoints

/**
 * Parse pagination params from request query
 * @param {import('express').Request} req
 * @param {object} defaults
 * @returns {{ page: number, limit: number, skip: number, sortBy: string, sortOrder: 'asc'|'desc', search: string }}
 */
export function parsePaginationParams(req, defaults = {}) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    parseInt(req.query.limit) || defaults.limit || 20,
    defaults.maxLimit || 100
  );
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || defaults.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
  const search = (req.query.search || "").trim();

  return { page, limit, skip, sortBy, sortOrder, search };
}

/**
 * Build a Prisma orderBy object
 * @param {string} sortBy
 * @param {'asc'|'desc'} sortOrder
 * @param {string[]} allowedFields
 * @param {string} defaultField
 */
export function buildOrderBy(sortBy, sortOrder, allowedFields, defaultField = "createdAt") {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return { [field]: sortOrder };
}

/**
 * Build a Prisma where clause for text search across multiple fields
 * @param {string} search
 * @param {string[]} fields
 */
export function buildSearchWhere(search, fields) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    })),
  };
}
