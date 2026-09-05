// backend/services/apiKey.service.js
// API Key management: round-robin rotation, error tracking, encryption

import crypto from "crypto";
import prisma from "../lib/prisma.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(config.encryption.secret)
  .digest(); // 32 bytes

/**
 * Encrypt an API key for storage
 * @param {string} plaintext
 * @returns {string} iv:encrypted (hex)
 */
function encryptKey(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a stored API key
 * @param {string} stored - iv:encrypted format
 * @returns {string}
 */
function decryptKey(stored) {
  const [ivHex, encryptedHex] = stored.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// Round-robin index per provider (in-memory, resets on restart)
const roundRobinIndex = {};

class ApiKeyService {
  /**
   * Get next available API key for a provider using round-robin
   * @param {string} providerSlug
   * @returns {Promise<{ keyId: string, plainKey: string }|null>}
   */
  async getNextKey(providerSlug) {
    const provider = await prisma.apiProvider.findUnique({
      where: { slug: providerSlug },
      include: {
        apiKeys: {
          where: { isActive: true, deletedAt: null },
          orderBy: { rotationIndex: "asc" },
        },
      },
    });

    if (!provider || !provider.isActive) return null;

    const activeKeys = provider.apiKeys;
    if (activeKeys.length === 0) return null;

    // Round-robin selection
    if (!roundRobinIndex[providerSlug]) roundRobinIndex[providerSlug] = 0;
    const idx = roundRobinIndex[providerSlug] % activeKeys.length;
    const key = activeKeys[idx];
    roundRobinIndex[providerSlug] = (idx + 1) % activeKeys.length;

    try {
      const plainKey = decryptKey(key.encryptedKey);
      return { 
        keyId: key.id, 
        plainKey, 
        label: key.label,
        defaultModel: provider.defaultModel,
        models: provider.models || []
      };
    } catch (err) {
      logger.error("Failed to decrypt API key", { keyId: key.id, error: err.message });
      return null;
    }
  }

  /**
   * Get all active keys for a provider (for retry logic)
   * @param {string} providerSlug
   * @returns {Promise<Array<{ keyId: string, plainKey: string }>>}
   */
  async getAllActiveKeys(providerSlug) {
    const provider = await prisma.apiProvider.findUnique({
      where: { slug: providerSlug },
      include: {
        apiKeys: { where: { isActive: true, deletedAt: null }, orderBy: { requestCount: "asc" } },
      },
    });

    if (!provider?.isActive) return [];

    const result = [];
    for (const key of provider.apiKeys) {
      try {
        const plainKey = decryptKey(key.encryptedKey);
        result.push({ keyId: key.id, plainKey, label: key.label });
      } catch {
        // Skip invalid keys
      }
    }
    return result;
  }

  /**
   * Record successful use of a key
   * @param {string} keyId
   */
  async recordSuccess(keyId) {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        lastUsedAt: new Date(),
        requestCount: { increment: 1 },
        lastRotatedAt: new Date(),
      },
    });
  }

  /**
   * Record error for a key
   * @param {string} keyId
   * @param {string} errorMessage
   */
  async recordError(keyId, errorMessage) {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        errorCount: { increment: 1 },
        lastError: errorMessage.slice(0, 500),
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Add a new API key
   * @param {{ providerId: string, label: string, plainKey: string, models?: string[] }} data
   */
  async createKey(data) {
    let actualProviderId = data.providerId;
    if (!actualProviderId.startsWith("c")) {
      const provider = await prisma.apiProvider.findUnique({ where: { slug: data.providerId } });
      if (!provider) throw new Error("Provider tidak ditemukan");
      actualProviderId = provider.id;
    }
    const encryptedKey = encryptKey(data.plainKey);
    return prisma.apiKey.create({
      data: {
        providerId: actualProviderId,
        label: data.label,
        encryptedKey,
        models: data.models || [],
        isActive: true,
      },
    });
  }

  /**
   * List all keys for a provider (without decrypting)
   * @param {string} providerId
   */
  async listKeys(providerId) {
    return prisma.apiKey.findMany({
      where: { providerId, deletedAt: null },
      select: {
        id: true,
        label: true,
        isActive: true,
        lastUsedAt: true,
        requestCount: true,
        errorCount: true,
        lastError: true,
        lastRotatedAt: true,
        models: true,
        createdAt: true,
        // Never select encryptedKey
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Toggle key active state
   * @param {string} keyId
   * @param {boolean} isActive
   */
  async toggleKey(keyId, isActive) {
    return prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive },
    });
  }

  /**
   * Soft delete a key
   * @param {string} keyId
   */
  async deleteKey(keyId) {
    return prisma.apiKey.update({
      where: { id: keyId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /**
   * Update key label (not the actual key value for security)
   * @param {string} keyId
   * @param {{ label?: string, plainKey?: string }} data
   */
  async updateKey(keyId, data) {
    const updateData = {};
    if (data.label) updateData.label = data.label;
    if (data.plainKey) updateData.encryptedKey = encryptKey(data.plainKey);
    return prisma.apiKey.update({ where: { id: keyId }, data: updateData });
  }
}

const apiKeyService = new ApiKeyService();
export default apiKeyService;
