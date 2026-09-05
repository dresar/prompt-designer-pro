import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);
const KEY = "promptstudio.theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = (typeof window !== "undefined" && (localStorage.getItem(KEY) as Theme)) || "light";
      setThemeState(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } catch {}
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
