// server.js
// Local development server — run with: npm run server

import { createApp } from "./backend/lib/express.js";
import config from "./backend/config/index.js";
import logger from "./backend/utils/logger.js";
import prisma from "./backend/lib/prisma.js";

const app = createApp();
const PORT = config.server.port;

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected");
  } catch (err) {
    logger.error("Error during shutdown", { error: err.message });
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info("━".repeat(60));
  logger.info(`🚀 PromptStudio AI Backend`);
  logger.info(`📡 Server: http://localhost:${PORT}`);
  logger.info(`📖 API Docs: http://localhost:${PORT}/api/docs`);
  logger.info(`🔍 Health: http://localhost:${PORT}/api/health`);
  logger.info(`🌍 Environment: ${config.env}`);
  logger.info("━".repeat(60));
});

export default server;
