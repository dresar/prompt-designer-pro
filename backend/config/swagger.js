// backend/config/swagger.js
// OpenAPI / Swagger spec configuration

import swaggerJsdoc from "swagger-jsdoc";
import config from "./index.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PromptStudio AI — API Documentation",
      version: config.app.version,
      description: "Production-ready backend API for PromptStudio AI SaaS platform",
      contact: { name: "PromptStudio AI", url: "https://promptstudio.ai" },
      license: { name: "MIT" },
    },
    servers: [
      { url: `${config.app.url}/api`, description: "Current Server" },
      { url: "http://localhost:3001/api", description: "Local Development" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Access Token — obtain from /api/auth/login",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        PaginatedResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiResponse" },
            {
              type: "object",
              properties: {
                meta: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalPages: { type: "integer" },
                    hasNextPage: { type: "boolean" },
                    hasPrevPage: { type: "boolean" },
                  },
                },
              },
            },
          ],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "admin"] },
            plan: { type: "string", enum: ["Free", "Pro", "Demo"] },
            avatar: { type: "string", nullable: true },
          },
        },
        GeneratePromptRequest: {
          type: "object",
          required: ["topic", "contentType", "style", "audience"],
          properties: {
            topic: { type: "string", description: "Judul / tema prompt" },
            contentType: { type: "string", description: "Jenis konten (Carousel Edukasi, Poster, dll)" },
            slides: { type: "integer", minimum: 1, maximum: 20, default: 5 },
            style: { type: "string" },
            audience: { type: "string" },
            language: { type: "string", enum: ["id", "en"], default: "id" },
            output: { type: "string", enum: ["prompt", "prompt+caption", "prompt+json"], default: "prompt" },
            globalPrompt: { type: "string", description: "Prompt tambahan dari template" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Prompts", description: "Prompt generation and history" },
      { name: "Templates", description: "Public template browsing" },
      { name: "Notifications", description: "User notifications" },
      { name: "Admin", description: "Admin-only endpoints" },
      { name: "Health", description: "Health and system endpoints" },
    ],
  },
  apis: ["./backend/routes/*.js", "./backend/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
