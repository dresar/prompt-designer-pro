// prisma/seed.js
// Seeds: Admin user, Demo user, API Providers, Default Settings, Categories, Sample Templates

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱 Starting database seed...");

  // ─── Hash passwords ────────────────────────────────────────────────────────
  const [adminHash, demoHash] = await Promise.all([
    bcrypt.hash("admin123", SALT_ROUNDS),
    bcrypt.hash("123456", SALT_ROUNDS),
  ]);

  // ─── Admin User ───────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@promptstudio.ai" },
    update: {},
    create: {
      name: "Admin PromptStudio",
      email: "admin@promptstudio.ai",
      passwordHash: adminHash,
      role: "admin",
      plan: "Pro",
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Demo User ────────────────────────────────────────────────────────────
  const demo = await prisma.user.upsert({
    where: { email: "demo@promptstudio.ai" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@promptstudio.ai",
      passwordHash: demoHash,
      role: "user",
      plan: "Demo",
      isActive: true,
    },
  });
  console.log(`✅ Demo user: ${demo.email}`);

  // ─── Subscriptions ────────────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, plan: "Pro", isActive: true },
  });

  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, plan: "Demo", isActive: true },
  });

  // ─── API Providers ────────────────────────────────────────────────────────
  const gemini = await prisma.apiProvider.upsert({
    where: { slug: "gemini" },
    update: {},
    create: {
      name: "Google Gemini",
      slug: "gemini",
      description: "Google Gemini Pro AI model",
      defaultModel: "gemini-2.5-flash",
      models: ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
      isActive: true,
      isDefault: true,
      priority: 1,
    },
  });

  const groq = await prisma.apiProvider.upsert({
    where: { slug: "groq" },
    update: {},
    create: {
      name: "Groq",
      slug: "groq",
      description: "Groq ultra-fast inference API",
      defaultModel: "llama-3.1-8b-instant",
      models: ["llama-3.1-8b-instant", "llama3-70b-8192", "mixtral-8x7b-32768"],
      isActive: true,
      isDefault: false,
      priority: 2,
    },
  });

  await prisma.apiProvider.upsert({
    where: { slug: "openai" },
    update: {},
    create: {
      name: "OpenAI",
      slug: "openai",
      description: "OpenAI GPT models (future)",
      defaultModel: "gpt-4o-mini",
      models: ["gpt-4o-mini", "gpt-4o"],
      isActive: false,
      isDefault: false,
      priority: 3,
    },
  });

  console.log(`✅ API Providers: gemini, groq, openai`);

  // ─── Default Settings ─────────────────────────────────────────────────────
  const defaultSettings = [
    { key: "app.name", value: "PromptStudio AI", type: "string", group: "general", label: "Nama Aplikasi", isPublic: true },
    { key: "app.tagline", value: "Generate prompt AI profesional dalam hitungan detik", type: "string", group: "general", label: "Tagline", isPublic: true },
    { key: "app.logo", value: "", type: "string", group: "general", label: "Logo URL", isPublic: true },
    { key: "app.favicon", value: "", type: "string", group: "general", label: "Favicon URL", isPublic: true },
    { key: "app.primaryColor", value: "#3B82F6", type: "string", group: "theme", label: "Warna Utama", isPublic: true },
    { key: "app.maintenanceMode", value: "false", type: "boolean", group: "general", label: "Maintenance Mode", isPublic: true },
    { key: "app.registrationEnabled", value: "true", type: "boolean", group: "general", label: "Registrasi Aktif", isPublic: true },
    { key: "ai.defaultProvider", value: "gemini", type: "string", group: "ai", label: "Provider AI Default", isPublic: false },
    { key: "ai.mode", value: "auto", type: "string", group: "ai", label: "Mode AI (auto/manual)", isPublic: false },
    { key: "ai.timeout", value: "30000", type: "number", group: "ai", label: "AI Request Timeout (ms)", isPublic: false },
    { key: "ai.maxRetries", value: "3", type: "number", group: "ai", label: "AI Max Retries", isPublic: false },
    { key: "ai.retryDelay", value: "1000", type: "number", group: "ai", label: "AI Retry Delay (ms)", isPublic: false },
    { key: "prompt.maxDailyFree", value: "10", type: "number", group: "limits", label: "Prompt Harian Free", isPublic: true },
    { key: "prompt.maxDailyPro", value: "500", type: "number", group: "limits", label: "Prompt Harian Pro", isPublic: true },
    { key: "prompt.maxDailyDemo", value: "5", type: "number", group: "limits", label: "Prompt Harian Demo", isPublic: true },
    { key: "prompt.maxSlides", value: "20", type: "number", group: "limits", label: "Maksimal Slide", isPublic: true },
    { key: "security.maxLoginAttempts", value: "5", type: "number", group: "security", label: "Maks Login Gagal", isPublic: false },
    { key: "security.lockoutDuration", value: "900", type: "number", group: "security", label: "Lockout Duration (s)", isPublic: false },
    { key: "security.jwtExpiresIn", value: "15m", type: "string", group: "security", label: "JWT Expiry", isPublic: false },
    { key: "security.refreshExpiresIn", value: "7d", type: "string", group: "security", label: "Refresh Token Expiry", isPublic: false },
    { key: "upload.maxFileSizeMb", value: "5", type: "number", group: "upload", label: "Maks File Upload (MB)", isPublic: false },
    { key: "imagekit.urlEndpoint", value: "https://ik.imagekit.io/your_id/", type: "string", group: "general", label: "ImageKit URL Endpoint", isPublic: true },
    { key: "app.version", value: "1.0.0", type: "string", group: "system", label: "Versi Aplikasi", isPublic: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ Default settings: ${defaultSettings.length} entries`);

  // ─── Prompt Generator Options ───────────────────────────────────────────────
  const generatorOptions = [
    // Content Types
    { type: "contentType", label: "Carousel Edukasi", value: "Carousel Edukasi", order: 1 },
    { type: "contentType", label: "Infografis", value: "Infografis", order: 2 },
    { type: "contentType", label: "Poster", value: "Poster", order: 3 },
    { type: "contentType", label: "Thumbnail YouTube", value: "Thumbnail YouTube", order: 4 },
    { type: "contentType", label: "Story Instagram", value: "Story Instagram", order: 5 },
    { type: "contentType", label: "Presentasi Bisnis", value: "Presentasi Bisnis", order: 6 },
    // Styles
    { type: "style", label: "Modern Technology", value: "Modern Technology", order: 1 },
    { type: "style", label: "Minimalist", value: "Minimalist", order: 2 },
    { type: "style", label: "Corporate", value: "Corporate", order: 3 },
    { type: "style", label: "Playful", value: "Playful", order: 4 },
    { type: "style", label: "Futuristic", value: "Futuristic", order: 5 },
    { type: "style", label: "Flat Design", value: "Flat Design", order: 6 },
    { type: "style", label: "3D Render", value: "3D Render", order: 7 },
    // Audiences
    { type: "audience", label: "Developer", value: "Developer", order: 1 },
    { type: "audience", label: "Professional", value: "Professional", order: 2 },
    { type: "audience", label: "Mahasiswa", value: "Mahasiswa", order: 3 },
    { type: "audience", label: "Anak Muda", value: "Anak Muda", order: 4 },
    { type: "audience", label: "Pemula / Awam", value: "Pemula / Awam", order: 5 },
    { type: "audience", label: "Investor", value: "Investor", order: 6 },
    // Languages
    { type: "language", label: "Indonesia", value: "id", order: 1 },
    { type: "language", label: "English", value: "en", order: 2 },
    // Outputs
    { type: "output", label: "Prompt Saja", value: "prompt", order: 1 },
    { type: "output", label: "Prompt + Caption", value: "prompt+caption", order: 2 },
    { type: "output", label: "Prompt + Data JSON", value: "prompt+json", order: 3 },
  ];

  for (const opt of generatorOptions) {
    await prisma.generatorOption.create({
      data: { ...opt, isActive: true },
    });
  }
  console.log(`✅ Generator Options: ${generatorOptions.length} entries`);

  // ─── Prompt Categories ────────────────────────────────────────────────────
  const categories = [
    { name: "Networking", slug: "networking", icon: "🌐", color: "#3B82F6", order: 1 },
    { name: "Auth & Security", slug: "auth", icon: "🔐", color: "#EF4444", order: 2 },
    { name: "DevOps", slug: "devops", icon: "⚙️", color: "#8B5CF6", order: 3 },
    { name: "Database", slug: "database", icon: "🗄️", color: "#F59E0B", order: 4 },
    { name: "Architecture", slug: "architecture", icon: "🏗️", color: "#10B981", order: 5 },
    { name: "API Design", slug: "api", icon: "🔗", color: "#6366F1", order: 6 },
    { name: "IoT", slug: "iot", icon: "📡", color: "#EC4899", order: 7 },
    { name: "Mobile Development", slug: "mobile", icon: "📱", color: "#14B8A6", order: 8 },
    { name: "Web Development", slug: "web", icon: "💻", color: "#F97316", order: 9 },
    { name: "Machine Learning", slug: "ml", icon: "🤖", color: "#84CC16", order: 10 },
    { name: "Cloud Computing", slug: "cloud", icon: "☁️", color: "#06B6D4", order: 11 },
    { name: "Blockchain", slug: "blockchain", icon: "⛓️", color: "#F59E0B", order: 12 },
    { name: "Data Science", slug: "data-science", icon: "📊", color: "#A855F7", order: 13 },
    { name: "Bisnis & Marketing", slug: "business", icon: "💼", color: "#22C55E", order: 14 },
    { name: "Pendidikan", slug: "education", icon: "🎓", color: "#EAB308", order: 15 },
    { name: "UI/UX Design", slug: "ui-ux", icon: "🎨", color: "#EC4899", order: 16 },
    { name: "Cyber Security", slug: "cyber-security", icon: "🛡️", color: "#DC2626", order: 17 },
    { name: "Programming", slug: "programming", icon: "👨‍💻", color: "#7C3AED", order: 18 },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.promptCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ Categories: ${categories.length} created`);

  // ─── Sample Prompt Templates ──────────────────────────────────────────────
  const templates = [];
  const contentTypes = ["Carousel Edukasi", "Infografis", "Poster", "Thumbnail YouTube", "Story Instagram", "Presentasi Bisnis"];
  const styles = ["Modern Technology", "Minimalist", "Corporate", "Playful", "Futuristic", "Flat Design", "3D Render"];
  const audiences = ["Developer", "Professional", "Mahasiswa", "Anak Muda", "Pemula / Awam", "Investor"];

  for (const cat of categories) {
    for (let i = 1; i <= 8; i++) {
      const slug = `${cat.slug}-template-${i}`;
      templates.push({
        title: `Template ${cat.name} ${i}`,
        slug: slug,
        description: `Deskripsi lengkap untuk template ${cat.name} variasi ke-${i}. Sangat cocok untuk kebutuhan konten profesional Anda.`,
        categoryId: categoryMap[cat.slug],
        tags: [cat.slug, "template", "design", `tag${i}`],
        contentType: contentTypes[i % contentTypes.length],
        slides: (i % 10) + 1,
        style: styles[i % styles.length],
        audience: audiences[i % audiences.length],
        language: i % 2 === 0 ? "en" : "id",
        output: i % 3 === 0 ? "prompt+json" : (i % 2 === 0 ? "prompt+caption" : "prompt"),
        isFeatured: i === 1,
        thumbnail: `https://picsum.photos/seed/${slug}/800/400`,
        globalPrompt: `Global prompt for ${cat.name} template ${i}...`,
        isActive: true,
        version: 1,
        usageCount: Math.floor(Math.random() * 1000)
      });
    }
  }

  // Clear existing templates to avoid slug conflicts if rerunning often, though upsert handles it.
  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: { slug: template.slug },
      update: { ...template },
      create: { ...template },
    });
  }
  console.log(`✅ Templates: ${templates.length} created (8 per category)`);

  // ─── Dummy Prompt History ────────────────────────────────────────────────
  const histories = [];
  const now = new Date();
  for (let i = 0; i < 150; i++) {
    // Generate dates spread over the last 14 days
    const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000));
    histories.push({
      userId: demo.id,
      title: `Topik Dummy ${i}`,
      contentType: contentTypes[i % contentTypes.length],
      slides: (i % 5) + 1,
      style: styles[i % styles.length],
      audience: audiences[i % audiences.length],
      language: i % 2 === 0 ? "en" : "id",
      provider: i % 2 === 0 ? "gemini" : "groq",
      modelUsed: i % 2 === 0 ? "gemini-2.5-flash" : "llama-3.1-8b-instant",
      promptText: "Ini adalah hasil generate dummy prompt...",
      createdAt: pastDate,
      updatedAt: pastDate,
    });
  }
  await prisma.promptHistory.createMany({
    data: histories,
  });
  console.log(`✅ Prompt History: 150 records created for Demo User`);

  // ─── Welcome Announcement ─────────────────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: "announcement-welcome" },
    update: {},
    create: {
      id: "announcement-welcome",
      title: "🎉 Selamat Datang di PromptStudio AI!",
      content: "Platform AI prompt generator profesional kini siap digunakan. Mulai buat prompt impian Anda sekarang!",
      type: "success",
      isActive: true,
      order: 1,
    },
  });
  console.log(`✅ Welcome announcement created`);

  // ─── Welcome Notifications for Demo User ─────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: demo.id,
      title: "Selamat datang di PromptStudio AI!",
      body: "Akun demo Anda sudah aktif. Mulai eksplorasi fitur-fitur canggih yang tersedia.",
      type: "success",
    },
  });
  console.log(`✅ Welcome notification for demo user`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("─".repeat(50));
  console.log("📧 Admin: admin@promptstudio.ai | Password: admin123");
  console.log("📧 Demo:  demo@promptstudio.ai  | Password: 123456");
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
