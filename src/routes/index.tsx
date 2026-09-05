import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Wand2, LibraryBig, Bot, Braces, Layers, Download,
  ArrowRight, Check, Zap, Palette, Shield, Star, LayoutDashboard
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptStudio AI — Generate Prompt Profesional untuk AI Image" },
      { name: "description", content: "Buat prompt AI image super detail untuk ChatGPT Image, Gemini, Grok, dan AI lainnya. Hasilkan poster, banner, carousel edukasi, infografis yang terlihat profesional." },
      { property: "og:title", content: "PromptStudio AI" },
      { property: "og:description", content: "Generate prompt AI image profesional yang tidak terlihat seperti hasil AI." },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  { icon: Wand2, title: "Prompt Generator", desc: "Bangun prompt super detail dalam hitungan detik, lengkap dengan style, layout, dan guardrail." },
  { icon: LibraryBig, title: "Template Library", desc: "Koleksi template siap pakai — dari edukasi developer sampai marketing sosial media." },
  { icon: Bot, title: "AI Ready", desc: "Dioptimalkan untuk ChatGPT Image, Gemini, Grok, Midjourney, dan generator populer lainnya." },
  { icon: Braces, title: "JSON Prompt", desc: "Output prompt dalam format JSON terstruktur untuk integrasi otomatis." },
  { icon: Layers, title: "Multi Slide Generator", desc: "Buat 3, 5, 8, sampai 10 slide carousel sekaligus dengan narasi yang koheren." },
  { icon: Download, title: "Export Prompt", desc: "Copy, download TXT, atau JSON — siap dipakai di workflow AI manapun." },
];

const STEPS = [
  { n: "01", title: "Pilih jenis desain", desc: "Carousel, poster, banner, infografis, thumbnail, dan banyak lagi." },
  { n: "02", title: "Isi tema", desc: "Masukkan topik seperti “HTTP vs HTTPS” atau “Session vs JWT”." },
  { n: "03", title: "Pilih jumlah slide", desc: "1, 3, 5, 8, atau 10 slide — kami atur kompositisinya." },
  { n: "04", title: "Generate prompt", desc: "PromptStudio menyusun prompt detail beserta guardrail anti-AI-look." },
  { n: "05", title: "Salin ke AI Image", desc: "Tempel ke ChatGPT, Gemini, Grok, dan biarkan AI bekerja." },
];

import { useAuth } from "@/contexts/auth-context";

function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mx-auto rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
              <Sparkles className="mr-1.5 h-3 w-3" /> AI Image Prompt Engine
            </Badge>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Generate Prompt <span className="text-gradient-brand">Profesional</span> untuk AI Image
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Buat prompt super detail agar hasil AI image Anda terlihat seperti dibuat oleh
              <span className="font-medium text-foreground"> desainer profesional</span> — bukan template AI biasa.
              Cocok untuk poster, banner, infografis, dan carousel edukasi.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link to={user.role === "admin" ? "/admin/dashboard" : "/generator"} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition-transform hover:scale-[1.02] sm:w-auto">
                  <LayoutDashboard className="h-4 w-4" /> Buka Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition-transform hover:scale-[1.02] sm:w-auto">
                    Mulai Sekarang
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto">
                    Coba Demo
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {user ? `Selamat datang kembali, ${user.name}` : "Gratis untuk dicoba · Tanpa kartu kredit · Demo login tersedia"}
            </p>
          </div>

          {/* Mock preview card */}
          <div className="relative mx-auto mt-16 max-w-5xl animate-float">
            <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
            <div className="relative rounded-3xl border bg-card p-2 shadow-premium">
              <div className="rounded-2xl bg-surface p-6 sm:p-8">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-destructive/70" />
                    <span className="h-3 w-3 shrink-0 rounded-full bg-yellow-400/80" />
                    <span className="h-3 w-3 shrink-0 rounded-full bg-success/80" />
                    <span className="ml-3 truncate text-xs text-muted-foreground">promptstudio.ai/generator</span>
                  </div>
                  <Badge className="rounded-full bg-success/10 text-success hover:bg-success/15">Ready</Badge>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-background p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Topik</p>
                      <p className="mt-1 text-lg font-semibold">HTTP vs HTTPS</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Carousel", "5 slide", "Apple Style", "Developer", "ID"].map((t) => (
                          <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-background p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Output</p>
                      <pre className="mt-2 max-h-40 overflow-hidden whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground">
{`You are a senior visual designer creating a carousel about "HTTP vs HTTPS".
DESIGN SYSTEM:
- Visual style: ultra-clean tech aesthetic, navy + electric blue, glassmorphism cards…
- Typography: Poppins, max 2 weights, clear scale…
- Avoid AI artifacts: NO distorted text, NO duplicated icons…`}
                      </pre>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary-glow p-4 text-primary-foreground shadow-elevated">
                        <div className="absolute inset-0 bg-grid-soft opacity-30" />
                        <p className="relative text-[10px] font-medium opacity-80">Slide {i + 1} / 5</p>
                        <p className="relative mt-8 text-lg font-bold leading-tight">{["HTTP", "Apa itu HTTPS?", "Perbedaan utama", "Kapan pakai?"][i]}</p>
                        <span className="absolute bottom-4 left-4 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">PromptStudio</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dioptimalkan untuk generator favorit Anda
          </p>
          <div className="mt-6 grid grid-cols-2 items-center gap-6 text-center text-sm font-semibold text-muted-foreground sm:grid-cols-3 lg:grid-cols-6">
            {["ChatGPT Image", "Gemini", "Grok", "Midjourney", "Stable Diffusion", "Leonardo"].map((n) => (
              <span key={n} className="opacity-70 transition-opacity hover:opacity-100">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="rounded-full bg-secondary text-secondary-foreground">Fitur Utama</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Semua yang Anda butuhkan untuk prompt premium</h2>
            <p className="mt-3 text-muted-foreground">Mulai dari ide sampai prompt siap pakai dengan guardrail anti-AI-look.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-elevated">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/40 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="rounded-full bg-secondary text-secondary-foreground">Cara Kerja</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">5 langkah menuju desain profesional</h2>
            <p className="mt-3 text-muted-foreground">Tanpa kurva belajar. Cukup pilih, isi, dan generate.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border bg-card p-5 shadow-soft">
                <span className="inline-flex h-9 items-center rounded-full bg-gradient-brand px-3 text-xs font-bold tracking-wider text-white">{s.n}</span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/40 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES TEASER */}
      <section id="templates" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge className="rounded-full bg-secondary text-secondary-foreground">Template Library</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Mulai dari template yang sudah teruji</h2>
              <p className="mt-3 text-muted-foreground">Pilih dari koleksi template populer seperti HTTP vs HTTPS, Session vs JWT, Docker vs VM, dan banyak lagi. Otomatis mengisi form generator Anda.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["12+ template developer & edukasi", "Style premium (Apple, Google, Glass, dll)", "Output prompt + JSON terstruktur", "Bisa di-export ke .txt atau .json"].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                      <Check className="h-3 w-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated">
                Jelajahi Template <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["HTTP vs HTTPS", "Session vs JWT", "Docker vs VM", "REST vs GraphQL", "SQL vs NoSQL", "OAuth vs JWT"].map((t, i) => (
                <div key={t} className="group rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      {[<Zap key="a" className="h-4 w-4" />, <Shield key="b" className="h-4 w-4" />, <Palette key="c" className="h-4 w-4" />, <Star key="d" className="h-4 w-4" />, <Wand2 key="e" className="h-4 w-4" />, <Layers key="f" className="h-4 w-4" />][i]}
                    </span>
                    <Badge variant="secondary" className="rounded-full text-[10px]">5 slide</Badge>
                  </div>
                  <p className="mt-4 text-sm font-semibold">{t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Apple Style · Developer</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground shadow-premium sm:p-14">
            <div className="absolute inset-0 bg-grid-soft opacity-20" />
            <div className="relative">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Siap membuat prompt yang terlihat seperti dibuat desainer?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                Mulai gratis hari ini. Demo tersedia tanpa registrasi.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {user ? (
                  <Link to={user.role === "admin" ? "/admin/dashboard" : "/generator"} className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-elevated transition-transform hover:scale-[1.02]">
                    Buka Dashboard Sekarang
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-elevated transition-transform hover:scale-[1.02]">
                      Buat Akun Gratis
                    </Link>
                    <Link to="/login" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                      Coba Demo Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
