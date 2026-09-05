// backend/services/template.service.js
// Template management with versioning, cloning, and search

import prisma from "../lib/prisma.js";
import cacheService from "./cache.service.js";
import { NotFound, Conflict, BadRequest } from "../utils/response.js";
import { parsePaginationParams, buildOrderBy, buildSearchWhere } from "../utils/pagination.js";

const TEMPLATE_CACHE_TTL = 180;

class TemplateService {
  /**
   * List templates with full filtering support
   */
  async list(req, includeInactive = false) {
    const { page, limit, skip, sortBy, sortOrder, search } = parsePaginationParams(req, { limit: 12 });
    const { categoryId, tag, featured, style, audience } = req.query;

    const where = {
      deletedAt: null,
      ...(includeInactive ? {} : { isActive: true }),
    };

    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.isFeatured = true;
    if (style) where.style = { contains: style, mode: "insensitive" };
    if (audience) where.audience = audience;
    if (tag) where.tags = { has: tag };

    if (search) {
      const searchClause = buildSearchWhere(search, ["title", "description", "contentType"]);
      where.AND = [
        ...(where.AND || []),
        { OR: [...searchClause.OR, { tags: { hasSome: [search] } }] },
      ];
    }

    const allowedSort = ["createdAt", "updatedAt", "title", "usageCount", "order"];
    const orderBy = buildOrderBy(sortBy, sortOrder, allowedSort);

    const [items, total] = await Promise.all([
      prisma.promptTemplate.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true, icon: true, color: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.promptTemplate.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get a single template by slug or id
   */
  async getOne(slugOrId) {
    const template = await prisma.promptTemplate.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        deletedAt: null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    if (!template) throw NotFound("Template tidak ditemukan");

    // Increment usage count
    await prisma.promptTemplate.update({
      where: { id: template.id },
      data: { usageCount: { increment: 1 } },
    });

    return template;
  }

  /**
   * Create a new template (admin)
   */
  async create(data, adminId) {
    const existing = await prisma.promptTemplate.findUnique({ where: { slug: data.slug } });
    if (existing) throw Conflict("Slug sudah digunakan");

    const template = await prisma.promptTemplate.create({
      data: {
        ...data,
        version: 1,
        usageCount: 0,
        isActive: data.isActive ?? true,
      },
    });

    // Save initial version
    await this._saveVersion(template, adminId, "Initial version");
    await cacheService.delPattern("template:*");

    return template;
  }

  /**
   * Update a template (admin) — saves version history
   */
  async update(id, data, adminId) {
    const template = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!template || template.deletedAt) throw NotFound("Template tidak ditemukan");

    // Save current version before updating
    await this._saveVersion(template, adminId, data._note || "Updated");

    // If slug changed, check uniqueness
    if (data.slug && data.slug !== template.slug) {
      const existing = await prisma.promptTemplate.findUnique({ where: { slug: data.slug } });
      if (existing) throw Conflict("Slug sudah digunakan");
    }

    delete data._note;

    const updated = await prisma.promptTemplate.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });

    await cacheService.delPattern("template:*");
    return updated;
  }

  /**
   * Soft delete a template
   */
  async delete(id) {
    const template = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!template) throw NotFound("Template tidak ditemukan");

    await prisma.promptTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await cacheService.delPattern("template:*");
  }

  /**
   * Clone a template
   */
  async clone(id, adminId) {
    const template = await prisma.promptTemplate.findUnique({ where: { id } });
    if (!template) throw NotFound("Template tidak ditemukan");

    const newSlug = `${template.slug}-copy-${Date.now()}`;
    const cloned = await prisma.promptTemplate.create({
      data: {
        title: `${template.title} (Copy)`,
        slug: newSlug,
        description: template.description,
        categoryId: template.categoryId,
        thumbnail: template.thumbnail,
        tags: template.tags,
        contentType: template.contentType,
        slides: template.slides,
        style: template.style,
        audience: template.audience,
        language: template.language,
        output: template.output,
        globalPrompt: template.globalPrompt,
        slidePrompts: template.slidePrompts,
        isFeatured: false,
        isActive: false,
        version: 1,
        usageCount: 0,
      },
    });

    await this._saveVersion(cloned, adminId, `Cloned from ${template.title}`);
    await cacheService.delPattern("template:*");
    return cloned;
  }

  /**
   * Get version history for a template
   */
  async getVersions(templateId) {
    return prisma.templateVersion.findMany({
      where: { templateId },
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { version: "desc" },
    });
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(templateId, version, adminId) {
    const versionRecord = await prisma.templateVersion.findFirst({
      where: { templateId, version: Number(version) },
    });
    if (!versionRecord) throw NotFound("Versi tidak ditemukan");

    const template = await prisma.promptTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw NotFound("Template tidak ditemukan");

    // Save current version before restoring
    await this._saveVersion(template, adminId, `Before restore to v${version}`);

    const data = versionRecord.data;
    const restored = await prisma.promptTemplate.update({
      where: { id: templateId },
      data: {
        title: data.title,
        description: data.description,
        globalPrompt: data.globalPrompt,
        slidePrompts: data.slidePrompts,
        contentType: data.contentType,
        slides: data.slides,
        style: data.style,
        audience: data.audience,
        language: data.language,
        output: data.output,
        tags: data.tags,
        version: { increment: 1 },
      },
    });

    await cacheService.delPattern("template:*");
    return restored;
  }

  /**
   * List categories
   */
  async getCategories(includeInactive = false) {
    return cacheService.getOrSet(`categories:${includeInactive}`, async () => {
      return prisma.promptCategory.findMany({
        where: {
          ...(includeInactive ? {} : { isActive: true }),
          deletedAt: null,
        },
        include: { _count: { select: { templates: { where: { isActive: true, deletedAt: null } } } } },
        orderBy: { order: "asc" },
      });
    }, TEMPLATE_CACHE_TTL);
  }

  /**
   * Save a version snapshot
   * @private
   */
  async _saveVersion(template, adminId, note) {
    const { id, createdAt, updatedAt, usageCount, ...data } = template;
    await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version: template.version,
        data,
        note,
        adminId,
      },
    });
  }
}

const templateService = new TemplateService();
export default templateService;
