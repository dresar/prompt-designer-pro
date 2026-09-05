// src/lib/api-client.ts
// Shared API client for all frontend → backend requests
// Handles JWT auth headers, error formatting, and response parsing

import { getAuthToken } from "@/contexts/auth-context";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: { auth?: boolean; signal?: AbortSignal } = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  const data = await res.json().catch(() => ({ success: false, message: "Invalid response" }));

  if (!res.ok || !data.success) {
    throw new ApiError(data.message || "Request gagal", res.status, data.code);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>("GET", path, undefined, { signal }),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export { ApiError };

// ─── Typed API calls ──────────────────────────────────────────────────────

export interface GeneratePromptInput {
  topic: string;
  contentType: string;
  slides: number;
  style: string;
  audience: string;
  language: "id" | "en";
  output: "prompt" | "prompt+caption" | "prompt+json";
  globalPrompt?: string;
  provider?: "gemini" | "groq" | "auto";
}

export interface GeneratePromptResult {
  prompt: string;
  caption?: string;
  json?: Record<string, unknown>;
  provider: string;
  tokensUsed?: number;
  isDummy: boolean;
  historyId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  meta?: any;
}

export async function generatePromptAPI(input: GeneratePromptInput): Promise<GeneratePromptResult> {
  const res = await apiClient.post<ApiResponse<GeneratePromptResult>>("/prompts/generate", input);
  return res.data;
}

export async function getPublicSettings() {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/system/info");
  return res.data;
}

export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category?: { name: string; slug: string };
  tags: string[];
  slides: number;
  style: string;
  audience: string;
  language: string;
}

export async function getTemplates(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return apiClient.get<ApiResponse<Template[]>>(`/templates${query}`);
}

export async function getTemplateBySlug(slug: string) {
  const res = await apiClient.get<ApiResponse<Template>>(`/templates/${slug}`);
  return res.data;
}

export async function getCategories() {
  return apiClient.get<ApiResponse<unknown>>("/templates/categories");
}

export async function getPromptHistory(page = 1) {
  return apiClient.get<ApiResponse<unknown>>(`/prompts/history?page=${page}`);
}

export async function getNotifications(page = 1) {
  return apiClient.get<ApiResponse<unknown>>(`/notifications?page=${page}`);
}

export async function markNotificationRead(id: string) {
  return apiClient.patch<ApiResponse<unknown>>(`/notifications/${id}/read`, {});
}

// ─── ADMIN API ────────────────────────────────────────────────────────────

// Dashboard
export async function getAdminStats() {
  const res = await apiClient.get<ApiResponse<any>>("/admin/dashboard");
  return res.data;
}

// API Keys
export interface ApiKey {
  id: string;
  providerId: string;
  label: string;
  isActive: boolean;
  requestCount: number;
  errorCount: number;
  models: string[];
  lastUsedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
}

export async function getAdminApiKeys() {
  const res = await apiClient.get<ApiResponse<ApiKey[]>>("/admin/api-keys");
  return res.data;
}

export async function addAdminApiKey(providerId: string, label: string, key: string, models?: string[]) {
  const payload: any = { providerId, label, plainKey: key };
  if (models && models.length > 0) payload.models = models;
  const res = await apiClient.post<ApiResponse<ApiKey>>("/admin/api-keys", payload);
  return res.data;
}

export async function toggleAdminApiKey(id: string, isActive: boolean) {
  const res = await apiClient.patch<ApiResponse<ApiKey>>(`/admin/api-keys/${id}/toggle`, { isActive });
  return res.data;
}

export async function deleteAdminApiKey(id: string) {
  return apiClient.delete<ApiResponse<unknown>>(`/admin/api-keys/${id}`);
}

export async function testAdminApiKey(id: string) {
  const res = await apiClient.post<ApiResponse<unknown>>(`/admin/api-keys/${id}/test`);
  return res.data;
}

// Templates (Prompt Generator)
export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  globalPrompt: string | null; // Used mostly as global prompt if slides are > 1
  slidePrompts?: string[];
  categoryId: string;
  category?: Category;
  style: string;
  audience: string;
  slides: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export async function getAdminTemplates(page = 1, limit = 50) {
  const res = await apiClient.get<ApiResponse<Template[]>>(`/admin/templates?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getAdminTemplate(id: string) {
  const res = await apiClient.get<ApiResponse<Template>>(`/admin/templates/${id}`);
  return res.data;
}

export async function createAdminTemplate(data: Partial<Template>) {
  const res = await apiClient.post<ApiResponse<Template>>("/admin/templates", data);
  return res.data;
}

export async function updateAdminTemplate(id: string, data: Partial<Template>) {
  const res = await apiClient.patch<ApiResponse<Template>>(`/admin/templates/${id}`, data);
  return res.data;
}

export async function deleteAdminTemplate(id: string) {
  return apiClient.delete<ApiResponse<unknown>>(`/admin/templates/${id}`);
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
}

export async function getAdminCategories() {
  const res = await apiClient.get<ApiResponse<Category[]>>("/admin/categories");
  return res.data;
}

export async function getAdminCategory(id: string) {
  const res = await apiClient.get<ApiResponse<Category>>(`/admin/categories/${id}`);
  return res.data;
}

export async function createAdminCategory(data: Partial<Category>) {
  const res = await apiClient.post<ApiResponse<Category>>("/admin/categories", data);
  return res.data;
}

export async function updateAdminCategory(id: string, data: Partial<Category>) {
  const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}`, data);
  return res.data;
}

export async function deleteAdminCategory(id: string) {
  return apiClient.delete<ApiResponse<unknown>>(`/admin/categories/${id}`);
}

// Options (Dynamic Form Data)
export interface GeneratorOption {
  id: string;
  type: string;
  label: string;
  value: string;
  isActive: boolean;
  order: number;
}

export async function getAdminOptions(type?: string, page = 1, limit = 50) {
  const query = type ? `?type=${type}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
  const res = await apiClient.get<ApiResponse<GeneratorOption[]>>(`/options${query}`);
  return res.data;
}

export async function getAdminOption(id: string) {
  const res = await apiClient.get<ApiResponse<GeneratorOption>>(`/options/${id}`);
  return res.data;
}

export async function createAdminOption(data: Partial<GeneratorOption>) {
  const res = await apiClient.post<ApiResponse<GeneratorOption>>("/options", data);
  return res.data;
}

export async function updateAdminOption(id: string, data: Partial<GeneratorOption>) {
  const res = await apiClient.patch<ApiResponse<GeneratorOption>>(`/options/${id}`, data);
  return res.data;
}

export async function deleteAdminOption(id: string) {
  return apiClient.delete<ApiResponse<unknown>>(`/options/${id}`);
}

export async function getPublicOptions() {
  const res = await apiClient.get<ApiResponse<Record<string, {label: string, value: string}[]>>>("/options/public");
  return res.data;
}

// Users
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  isActive: boolean;
  avatar: string | null;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
}

export async function getAdminUsers(page = 1, limit = 50, search = "") {
  const res = await apiClient.get<ApiResponse<User[]>>(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return res;
}

export async function getAdminUser(id: string) {
  const res = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  return res.data;
}

export async function updateAdminUser(id: string, data: Partial<User>) {
  const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
  return res.data;
}

export async function createAdminUser(data: any) {
  const res = await apiClient.post<ApiResponse<User>>(`/admin/users`, data);
  return res.data;
}

export async function resetAdminUserPassword(id: string, newPassword: string) {
  const res = await apiClient.post<ApiResponse<unknown>>(`/admin/users/${id}/reset-password`, { newPassword });
  return res.data;
}

export async function deleteAdminUser(id: string) {
  return apiClient.delete<ApiResponse<unknown>>(`/admin/users/${id}`);
}

