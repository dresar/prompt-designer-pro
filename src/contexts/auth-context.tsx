// src/contexts/auth-context.tsx
// Authentication context — connects to PromptStudio AI backend API
// Falls back to mock mode if API is unavailable (demo/dev)

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "Free" | "Pro" | "Demo";
  role?: "user" | "admin";
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  loginDemo: () => Promise<{ role: string }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "promptstudio.auth.user";
const TOKEN_KEY = "promptstudio.auth.token";
const API_BASE = "/api";

export const DEMO_CREDENTIALS = {
  email: "demo@promptstudio.ai",
  password: "123456",
};

// ─── API helpers ───────────────────────────────────────────────────────────

async function apiPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    credentials: "include", // for httpOnly refresh cookie
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request gagal");
  return data;
}

async function apiPatch(path: string, body: unknown, token: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request gagal");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persistUser = (u: User | null, token?: string) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else if (u === null) {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const data = await apiPost("/auth/login", { email, password });
    const { user: u, accessToken } = data.data;
    persistUser(
      { id: u.id, name: u.name, email: u.email, avatar: u.avatar, plan: u.plan, role: u.role },
      accessToken
    );
    return { role: u.role };
  };

  const loginDemo: AuthContextValue["loginDemo"] = async () => {
    const data = await apiPost("/auth/demo", {});
    const { user: u, accessToken } = data.data;
    persistUser(
      { id: u.id, name: u.name, email: u.email, avatar: u.avatar, plan: u.plan, role: u.role },
      accessToken
    );
    return { role: u.role };
  };

  const register: AuthContextValue["register"] = async (name, email, password) => {
    const data = await apiPost("/auth/register", { name, email, password });
    const { user: u, accessToken } = data.data;
    persistUser(
      { id: u.id, name: u.name, email: u.email, plan: u.plan, role: u.role },
      accessToken
    );
  };

  const forgotPassword: AuthContextValue["forgotPassword"] = async (email) => {
    await apiPost("/auth/forgot-password", { email });
  };

  const logout: AuthContextValue["logout"] = async () => {
    const token = getToken();
    persistUser(null); // Langsung hapus sesi dari UI (Optimistic Logout)
    try {
      if (token) await apiPost("/auth/logout", {}, token);
    } catch {}
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (patch) => {
    const token = getToken();
    if (!token || !user) return;
    const data = await apiPatch("/auth/profile", patch, token);
    const updatedUser = { ...user, ...data.data };
    persistUser(updatedUser, token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, register, forgotPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Get stored JWT token (for API calls from other components) */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
