// backend/utils/logger.js
// Winston structured logger — writes to console + file in production

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";
const isVercel = !!process.env.VERCEL;

// Custom format: timestamp + level + message + optional metadata
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  isDev
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    : winston.format.json()
);

const transports = [
  // Always log to console
  new winston.transports.Console({
    silent: process.env.LOG_SILENT === "true",
  }),
];

// Add file transports only in non-serverless environments
if (!isVercel && !isDev) {
  const logsDir = path.join(__dirname, "../../logs");
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: logFormat,
  transports,
  exitOnError: false,
});

export default logger;
