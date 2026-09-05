// backend/config/cors.js
// CORS configuration factory

import config from "./index.js";

const corsOptions = {
  // Mengizinkan semua origin secara otomatis agar tidak perlu setting .env yang rumit
  origin: true,
  credentials: true, // Allow cookies (refresh token)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Api-Version",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page", "X-Rate-Limit-Remaining"],
  maxAge: 86400, // 24 hours preflight cache
};

export default corsOptions;
