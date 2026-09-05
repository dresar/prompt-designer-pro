// backend/middleware/upload.middleware.js
// File upload middleware using multer with Cloudinary or local storage

import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { BadRequest } from "../utils/response.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";

// ─── Configure storage ────────────────────────────────────────────────────

let storage;

if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: `promptstudio/${req.uploadFolder || "general"}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
    }),
  });

  logger.info("Upload: Cloudinary storage configured");
} else {
  // Local disk storage fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), config.upload.uploadDir);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  logger.info("Upload: Local disk storage configured");
}

// ─── File filter ──────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequest(`Tipe file tidak diizinkan. Gunakan: ${config.upload.allowedMimeTypes.join(", ")}`));
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSizeBytes },
});

// ─── Middleware factories ──────────────────────────────────────────────────

/**
 * Upload single image
 * @param {string} fieldName - Form field name
 * @param {string} folder - Cloudinary folder or local subfolder
 */
export function uploadSingle(fieldName, folder = "general") {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.single(fieldName)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

/**
 * Get URL from uploaded file (works with both Cloudinary and local)
 * @param {Express.Multer.File} file
 * @returns {string}
 */
export function getFileUrl(file) {
  if (!file) return null;
  // Cloudinary returns .path or .secure_url
  if (file.path?.startsWith("http")) return file.path;
  if (file.filename) {
    return `${config.app.url}/uploads/${file.filename}`;
  }
  return null;
}
