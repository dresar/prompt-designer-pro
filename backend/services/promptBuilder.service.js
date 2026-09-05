// backend/services/promptBuilder.service.js
// Assembles the full AI prompt from frontend input + design system rules
// Frontend sends simple data; this service builds the comprehensive prompt

const STYLE_DETAILS = {
  "Modern Technology": "ultra-clean tech aesthetic, deep navy (#0B3D91) and electric blue (#3B82F6) gradients, subtle grid background, glowing accent lines, glassmorphism cards, futuristic sans-serif typography (Inter / Geist)",
  Corporate: "professional corporate visual, navy and white palette, structured grid layout, confident serif headlines, generous whitespace",
  "Apple Style": "minimal Apple-like design, soft pastel backgrounds, SF Pro inspired typography, generous padding, subtle depth, premium feel",
  "Google Style": "Material Design 3 inspired, expressive color tokens, rounded geometry, friendly typography (Google Sans / Roboto)",
  Glassmorphism: "frosted glass cards over vibrant gradient background, soft blurs, translucent layers, neon accent highlights",
  Minimal: "ultra minimalistic flat design, mostly white, single accent color, refined typography hierarchy, lots of whitespace",
  Futuristic: "cyber-futuristic look, dark UI, holographic gradient accents, mono/display typography, glowing data-viz elements",
  Magazine: "editorial magazine layout, large display serif headlines, multi-column grid, photo-led composition",
};

const AUDIENCE_DETAILS = {
  Pemula: "explained in simple terms, friendly tone, beginner-friendly metaphors and icons",
  Mahasiswa: "structured like a study material, clear bullet points, academic but engaging tone",
  Developer: "technically accurate, includes code-style accents and dev-friendly terminology",
  Professional: "executive-friendly framing, business value emphasized, polished and confident tone",
};

const SLIDE_LABELS = [
  "Cover", "Hook / Problem", "Concept A", "Concept B", "Comparison",
  "Deep Dive", "Real-world Use", "Best Practice", "Mistakes to Avoid", "CTA / Summary",
];

/**
 * @typedef {object} PromptInput
 * @property {string} contentType
 * @property {string} topic
 * @property {number} slides
 * @property {string} style
 * @property {string} audience
 * @property {'id'|'en'} language
 * @property {'prompt'|'prompt+caption'|'prompt+json'} output
 * @property {string} [globalPrompt] - Optional custom prompt from template
 */

/**
 * @typedef {object} BuiltPrompt
 * @property {string} systemPrompt
 * @property {string} userPrompt
 * @property {string} fullPrompt
 */

class PromptBuilderService {
  /**
   * Build the full AI prompt from user input
   * @param {PromptInput} input
   * @returns {BuiltPrompt}
   */
  build(input) {
    const styleDetail = STYLE_DETAILS[input.style] ?? input.style;
    const audienceDetail = AUDIENCE_DETAILS[input.audience] ?? input.audience;
    const lang = input.language === "id" ? "Indonesian" : "English";
    const isMulti = input.slides > 1;

    // System prompt — role definition
    const systemPrompt = [
      `You are a world-class visual design director specializing in ${input.contentType.toLowerCase()} creation.`,
      `Your designs are featured in top-tier tech publications like Vercel, Linear, Notion, and Apple.`,
      `You create prompts for AI image generators (Midjourney, DALL-E, Stable Diffusion) that produce publication-ready visuals.`,
      `All on-image text must be in ${lang}.`,
    ].join(" ");

    // Design system block
    const designSystem = [
      `DESIGN SYSTEM:`,
      `- Visual style: ${styleDetail}.`,
      `- Audience: ${input.audience} — ${audienceDetail}.`,
      `- Language for all on-image text: ${lang}.`,
      `- Layout: ${isMulti ? `${input.slides}-slide cohesive series with consistent visual identity` : "single composition with strong focal hierarchy"}.`,
      `- Typography: at most 2 typefaces, clear scale (display / body / caption), proper kerning and tracking.`,
      `- Color palette: brand-grade, max 4 colors, accessible contrast (WCAG AA+).`,
      `- Illustration: ${input.style === "Futuristic" ? "abstract geometric, data-viz, glow effects" : "iconographic, vector-style, semantically meaningful"}. NO generic stock photo style.`,
    ].join("\n");

    // Negative constraints
    const negativePrompt = [
      `AVOID ABSOLUTELY:`,
      `- Distorted, blurry, or unreadable text`,
      `- AI artifacts, uncanny faces, distorted hands`,
      `- Overly saturated or neon-heavy backgrounds that hurt readability`,
      `- Duplicate or floating icons with no semantic meaning`,
      `- Generic "AI-generated look" — must feel human-designed`,
      `- Clipart, watermarks, or low-resolution elements`,
    ].join("\n");

    // Slide plan or single composition
    let composition;
    if (isMulti) {
      const slideLines = Array.from({ length: input.slides }, (_, i) => {
        const label = SLIDE_LABELS[i] ?? `Detail ${i + 1}`;
        return `Slide ${i + 1} — ${label}: concise headline (max 6 words), supporting subtext (max 18 words), 1 hero visual aligned to the design system.`;
      });
      composition = `\nSLIDE PLAN (${input.slides} slides, cohesive series):\n${slideLines.join("\n")}`;
    } else {
      composition = `\nCOMPOSITION:\n- One bold focal headline (max 8 words)\n- Short supporting line (max 24 words)\n- Single hero illustration aligned to the brand palette\n- Strong visual hierarchy: viewer knows exactly where to look first`;
    }

    // Quality bar
    const qualityBar = [
      `\nQUALITY BAR:`,
      `- Output must feel like it was created by a senior brand designer at a top-tier company.`,
      `- Every element must have intentional placement, color, and size.`,
      `- Premium feel: balanced whitespace, sharp typography, intentional color use.`,
      `- The final result must NOT look AI-generated. Treat it as if it will ship to paying customers.`,
    ].join("\n");

    // Custom global prompt from template (if any)
    const customPrompt = input.globalPrompt
      ? `\nCUSTOM REQUIREMENTS:\n${input.globalPrompt}`
      : "";

    // Main topic header
    const header = `Create a ${input.contentType.toLowerCase()} about: "${input.topic || "[topic to be filled]"}".`;

    const userPrompt = [header, "", designSystem, composition, negativePrompt, qualityBar, customPrompt]
      .join("\n")
      .trim();

    return {
      systemPrompt,
      userPrompt,
      fullPrompt: `${systemPrompt}\n\n${userPrompt}`,
    };
  }

  /**
   * Generate the local (client-side equivalent) prompt for fallback/dummy mode
   * @param {PromptInput} input
   * @returns {{ prompt: string, caption?: string, json?: object }}
   */
  buildLocal(input) {
    const { fullPrompt } = this.build(input);
    const result = { prompt: fullPrompt };

    if (input.output === "prompt+caption") {
      result.caption =
        input.language === "id"
          ? `🚀 ${input.topic || "Topik"} — explained with a ${input.style} visual.\n\nSimpan & bagikan ✨\n\n#${input.contentType.replace(/\s+/g, "")} #PromptStudioAI`
          : `🚀 ${input.topic || "Topic"} — ${input.style} visual design.\n\nSave & share ✨\n\n#${input.contentType.replace(/\s+/g, "")} #PromptStudioAI`;
    }

    if (input.output === "prompt+json") {
      result.json = {
        meta: { topic: input.topic, contentType: input.contentType, style: input.style, audience: input.audience, language: input.language, slides: input.slides },
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
          label: SLIDE_LABELS[i] ?? `Slide ${i + 1}`,
          headline: `[Slide ${i + 1} headline — fill in]`,
          subtext: `[Supporting copy for slide ${i + 1}]`,
          visual: "vector illustration aligned to palette",
        })),
        guardrails: ["no distorted text", "no AI artifacts", "WCAG AA contrast", "max 2 typefaces"],
      };
    }

    return result;
  }
}

const promptBuilderService = new PromptBuilderService();
export default promptBuilderService;
