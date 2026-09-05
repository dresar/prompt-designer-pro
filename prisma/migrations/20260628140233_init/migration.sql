-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('Free', 'Pro', 'Demo');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('info', 'warning', 'success', 'danger');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error', 'announcement');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "plan" "Plan" NOT NULL DEFAULT 'Free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "bio" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'Free',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "slides" INTEGER NOT NULL DEFAULT 5,
    "output" TEXT NOT NULL DEFAULT 'prompt',
    "promptText" TEXT NOT NULL,
    "captionText" TEXT,
    "jsonData" JSONB,
    "provider" TEXT,
    "tokensUsed" INTEGER,
    "responseMs" INTEGER,
    "isDummy" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_prompts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptHistoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "thumbnail" TEXT,
    "tags" TEXT[],
    "contentType" TEXT NOT NULL,
    "slides" INTEGER NOT NULL DEFAULT 5,
    "style" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "output" TEXT NOT NULL DEFAULT 'prompt',
    "globalPrompt" TEXT,
    "slidePrompts" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "note" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastRotatedAt" TIMESTAMP(3),
    "rotationIndex" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "providerId" TEXT,
    "userId" TEXT,
    "promptHistoryId" TEXT,
    "requestMs" INTEGER,
    "tokensUsed" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'info',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "position" TEXT NOT NULL DEFAULT 'dashboard',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SettingType" NOT NULL DEFAULT 'string',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_plan_idx" ON "users"("plan");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_lastActive_idx" ON "sessions"("lastActive");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_plan_idx" ON "subscriptions"("plan");

-- CreateIndex
CREATE INDEX "prompt_histories_userId_idx" ON "prompt_histories"("userId");

-- CreateIndex
CREATE INDEX "prompt_histories_createdAt_idx" ON "prompt_histories"("createdAt");

-- CreateIndex
CREATE INDEX "prompt_histories_provider_idx" ON "prompt_histories"("provider");

-- CreateIndex
CREATE INDEX "favorite_prompts_userId_idx" ON "favorite_prompts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_prompts_userId_promptHistoryId_key" ON "favorite_prompts"("userId", "promptHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_categories_slug_key" ON "prompt_categories"("slug");

-- CreateIndex
CREATE INDEX "prompt_categories_slug_idx" ON "prompt_categories"("slug");

-- CreateIndex
CREATE INDEX "prompt_categories_isActive_idx" ON "prompt_categories"("isActive");

-- CreateIndex
CREATE INDEX "prompt_categories_order_idx" ON "prompt_categories"("order");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_slug_key" ON "prompt_templates"("slug");

-- CreateIndex
CREATE INDEX "prompt_templates_slug_idx" ON "prompt_templates"("slug");

-- CreateIndex
CREATE INDEX "prompt_templates_categoryId_idx" ON "prompt_templates"("categoryId");

-- CreateIndex
CREATE INDEX "prompt_templates_isFeatured_idx" ON "prompt_templates"("isFeatured");

-- CreateIndex
CREATE INDEX "prompt_templates_isActive_idx" ON "prompt_templates"("isActive");

-- CreateIndex
CREATE INDEX "prompt_templates_tags_idx" ON "prompt_templates"("tags");

-- CreateIndex
CREATE INDEX "prompt_templates_createdAt_idx" ON "prompt_templates"("createdAt");

-- CreateIndex
CREATE INDEX "template_versions_templateId_idx" ON "template_versions"("templateId");

-- CreateIndex
CREATE INDEX "template_versions_version_idx" ON "template_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "api_providers_slug_key" ON "api_providers"("slug");

-- CreateIndex
CREATE INDEX "api_providers_slug_idx" ON "api_providers"("slug");

-- CreateIndex
CREATE INDEX "api_providers_isActive_idx" ON "api_providers"("isActive");

-- CreateIndex
CREATE INDEX "api_keys_providerId_idx" ON "api_keys"("providerId");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- CreateIndex
CREATE INDEX "api_keys_lastUsedAt_idx" ON "api_keys"("lastUsedAt");

-- CreateIndex
CREATE INDEX "api_usage_logs_apiKeyId_idx" ON "api_usage_logs"("apiKeyId");

-- CreateIndex
CREATE INDEX "api_usage_logs_providerId_idx" ON "api_usage_logs"("providerId");

-- CreateIndex
CREATE INDEX "api_usage_logs_userId_idx" ON "api_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "api_usage_logs_createdAt_idx" ON "api_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_usage_logs_success_idx" ON "api_usage_logs"("success");

-- CreateIndex
CREATE INDEX "announcements_isActive_idx" ON "announcements"("isActive");

-- CreateIndex
CREATE INDEX "announcements_startAt_idx" ON "announcements"("startAt");

-- CreateIndex
CREATE INDEX "announcements_endAt_idx" ON "announcements"("endAt");

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

-- CreateIndex
CREATE INDEX "banners_position_idx" ON "banners"("position");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_entity_idx" ON "activity_logs"("entity");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");

-- CreateIndex
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_histories" ADD CONSTRAINT "prompt_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_prompts" ADD CONSTRAINT "favorite_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_prompts" ADD CONSTRAINT "favorite_prompts_promptHistoryId_fkey" FOREIGN KEY ("promptHistoryId") REFERENCES "prompt_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "prompt_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "api_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "api_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_promptHistoryId_fkey" FOREIGN KEY ("promptHistoryId") REFERENCES "prompt_histories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
