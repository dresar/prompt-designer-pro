import type { GeneratorInput } from "@/lib/prompt-engine";

const KEY = "promptstudio.generator.prefill";

export function setPrefill(input: GeneratorInput) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(input));
}

export function consumePrefill(): GeneratorInput | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try { return JSON.parse(raw) as GeneratorInput; } catch { return null; }
}
