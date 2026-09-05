// backend/config/index.js
// Centralized config — reads from env vars with sensible defaults

const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isVercel: !!process.env.VERCEL,

  server: {
    port: parseInt(process.env.PORT || "3001"),
    apiPrefix: "/api",
  },

  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change-me-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-in-production-refresh",
    accessExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
      .split(",")
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    authWindowMs: 15 * 60 * 1000,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10"),
  },

  encryption: {
    secret: process.env.ENCRYPTION_SECRET || "change-me-32-char-encryption-key",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    enabled: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
  },

  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },

  upload: {
    maxFileSizeBytes: parseInt(process.env.UPLOAD_MAX_SIZE_MB || "5") * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },

  ai: {
    timeout: parseInt(process.env.AI_TIMEOUT_MS || "30000"),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || "3"),
    retryDelay: parseInt(process.env.AI_RETRY_DELAY_MS || "1000"),
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    silent: process.env.LOG_SILENT === "true",
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_SECONDS || "900"),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
  },

  app: {
    name: "PromptStudio AI",
    version: process.env.npm_package_version || "1.0.0",
    url: process.env.APP_URL || "http://localhost:3001",
  },
};

export default config;
