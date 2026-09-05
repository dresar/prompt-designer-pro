import type { PromptTemplate } from "./templates";

export interface GeneratorInput {
  contentType: string;
  topic: string;
  slides: number;
  style: string;
  audience: string;
  language: "id" | "en";
  output: "prompt" | "prompt+caption" | "prompt+json";
}

export interface GeneratedPrompt {
  prompt: string;
  caption?: string;
  json?: Record<string, unknown>;
  provider?: string;
  isDummy?: boolean;
}

const STYLE_DETAILS: Record<string, string> = {
  "Modern Technology": "ultra-clean tech aesthetic, deep navy (#0B3D91) and electric blue (#3B82F6) gradients, subtle grid background, glowing accent lines, glassmorphism cards, futuristic sans-serif typography (Inter / Geist)",
  "Corporate": "professional corporate visual, navy and white palette, structured grid layout, confident serif headlines, generous whitespace",
  "Apple Style": "minimal Apple-like design, soft pastel backgrounds, SF Pro inspired typography, generous padding, subtle depth, premium feel",
  "Google Style": "Material Design 3 inspired, expressive color tokens, rounded geometry, friendly typography (Google Sans / Roboto)",
  "Glassmorphism": "frosted glass cards over vibrant gradient background, soft blurs, translucent layers, neon accent highlights",
  "Minimal": "ultra minimalistic flat design, mostly white, single accent color, refined typography hierarchy, lots of whitespace",
  "Futuristic": "cyber-futuristic look, dark UI, holographic gradient accents, mono/display typography, glowing data-viz elements",
  "Magazine": "editorial magazine layout, large display serif headlines, multi-column grid, photo-led composition",
};

const AUDIENCE_DETAILS: Record<string, string> = {
  Pemula: "explained in simple terms, friendly tone, beginner-friendly metaphors and icons",
  Mahasiswa: "structured like a study material, clear bullet points, academic but engaging tone",
  Developer: "technically accurate, includes code-style accents and dev-friendly terminology",
  Professional: "executive-friendly framing, business value emphasized, polished and confident tone",
};

export function generatePrompt(input: GeneratorInput): GeneratedPrompt {
  const styleDetail = STYLE_DETAILS[input.style] ?? input.style;
  const audienceDetail = AUDIENCE_DETAILS[input.audience] ?? input.audience;
  const lang = input.language === "id" ? "Indonesian" : "English";
  const isMulti = input.slides > 1;

  const header = `You are a senior visual designer creating a ${input.contentType.toLowerCase()} about: "${input.topic || "[topic]"}".`;

  const designSystem = [
    `DESIGN SYSTEM:`,
    `- Visual style: ${styleDetail}.`,
    `- Audience: ${input.audience} — ${audienceDetail}.`,
    `- Language for all on-image text: ${lang}.`,
    `- Layout: ${isMulti ? `${input.slides}-slide cohesive series with consistent grid` : "single composition with strong focal hierarchy"}.`,
    `- Typography: at most 2 typefaces, clear scale (display / body / caption), proper kerning.`,
    `- Color palette: brand-grade, max 4 colors, accessible contrast (WCAG AA+).`,
    `- Illustration style: ${input.style === "Futuristic" ? "abstract geometric, data-viz, glow" : "iconographic, vector-style, semantic"}. No generic stock photos.`,
    `- Avoid AI artifacts: NO distorted text, NO unreadable glyphs, NO duplicated icons, NO over-saturated colors, NO generic "AI look".`,
  ].join("\n");

  const composition = isMulti
    ? `\nSLIDE PLAN (${input.slides} slides):\n` +
      Array.from({ length: input.slides }, (_, i) => {
        const labels = ["Cover", "Hook / Problem", "Concept A", "Concept B", "Comparison", "Deep Dive", "Real-world Use", "Best Practice", "Mistakes to Avoid", "CTA / Summary"];
        return `Slide ${i + 1} — ${labels[i] ?? "Detail"}: concise headline (max 6 words), supporting subtext (max 18 words), 1 hero visual.`;
      }).join("\n")
    : `\nCOMPOSITION:\n- One bold focal headline\n- Short supporting line (max 24 words)\n- Single hero illustration aligned to the brand palette`;

  const quality = `\nQUALITY BAR:\n- Looks like it was made by a senior brand designer (think Linear, Vercel, Notion, Apple).\n- Premium feel: balanced whitespace, sharp typography, intentional color use.\n- Output must NOT look AI-generated. Treat every element as if it will ship to a paying customer.`;

  const techNote = input.output === "prompt+json"
    ? `\nWhen rendering, follow the accompanying JSON spec strictly for slide order, copy, and color tokens.`
    : "";

  const prompt = [header, "", designSystem, composition, quality, techNote].join("\n").trim();

  let caption: string | undefined;
  if (input.output === "prompt+caption") {
    caption =
      input.language === "id"
        ? `🚀 ${input.topic || "Topik"} — dijelaskan dengan visual ${input.style.toLowerCase()}.\n\nSimpan & bagikan kalau bermanfaat ✨\n\n#${input.contentType.replace(/\s+/g, "")} #BelajarBareng #PromptStudioAI`
        : `🚀 ${input.topic || "Topic"} — explained with a ${input.style.toLowerCase()} visual style.\n\nSave & share if it helps ✨\n\n#${input.contentType.replace(/\s+/g, "")} #LearnDaily #PromptStudioAI`;
  }

  let json: Record<string, unknown> | undefined;
  if (input.output === "prompt+json") {
    json = {
      meta: {
        topic: input.topic,
        contentType: input.contentType,
        style: input.style,
        audience: input.audience,
        language: input.language,
        slides: input.slides,
      },
      design: {
        palette: ["#0B3D91", "#3B82F6", "#22C55E", "#F8FAFC"],
        typography: { display: "Poppins SemiBold", body: "Poppins Regular" },
        radius: "16px",
        spacing: "generous",
        mood: input.style,
      },
      slides: Array.from({ length: input.slides }, (_, i) => ({
        index: i + 1,
        role: i === 0 ? "cover" : i === input.slides - 1 ? "cta" : "content",
        headline: `Slide ${i + 1} headline`,
        subtext: `Supporting copy for slide ${i + 1}`,
        visual: "vector illustration aligned to palette",
      })),
      guardrails: [
        "no distorted text",
        "no AI artifacts",
        "WCAG AA contrast",
        "max 2 typefaces",
      ],
    };
  }

  return { prompt, caption, json };
}

export function fromTemplate(t: PromptTemplate): GeneratorInput {
  return {
    contentType: t.contentType,
    topic: t.title,
    slides: t.slides,
    style: t.style,
    audience: t.audience,
    language: t.language,
    output: t.output,
  };
}
