// backend/controllers/system.controller.js
// System info, status, and version endpoints

import { sendSuccess } from "../utils/response.js";
import settingsService from "../services/settings.service.js";
import config from "../config/index.js";

export async function getInfo(req, res, next) {
  try {
    const publicSettings = await settingsService.getPublic();
    sendSuccess(res, {
      data: {
        name: publicSettings["app.name"] || config.app.name,
        version: config.app.version,
        tagline: publicSettings["app.tagline"] || "",
        logo: publicSettings["app.logo"] || "",
        favicon: publicSettings["app.favicon"] || "",
        primaryColor: publicSettings["app.primaryColor"] || "#3B82F6",
        maintenanceMode: publicSettings["app.maintenanceMode"] || false,
        registrationEnabled: publicSettings["app.registrationEnabled"] !== false,
        "imagekit.urlEndpoint": publicSettings["imagekit.urlEndpoint"] || "",
        maxSlidesPerPrompt: publicSettings["prompt.maxSlides"] || 20,
        plan: {
          freeMaxDaily: publicSettings["prompt.maxDailyFree"] || 10,
          proMaxDaily: publicSettings["prompt.maxDailyPro"] || 500,
        },
      },
    });
  } catch (err) { next(err); }
}

export async function getStatus(req, res, next) {
  try {
    sendSuccess(res, {
      data: {
        status: "operational",
        environment: config.env,
        isVercel: config.isVercel,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) { next(err); }
}

export async function getVersion(req, res, next) {
  sendSuccess(res, {
    data: {
      version: config.app.version,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  });
}
