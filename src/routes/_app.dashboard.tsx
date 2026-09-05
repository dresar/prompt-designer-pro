import { createFileRoute, Link } from "@tanstack/react-router";
import { Wand2, LibraryBig, History, TrendingUp, Sparkles, ArrowRight, Clock, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/templates";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · PromptStudio AI" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const featured = TEMPLATES.slice(0, 3);

  const stats = [
    { label: "Prompt dibuat", value: "0", icon: Wand2, hint: "Mulai generator" },
    { label: "Template favorit", value: "0", icon: LibraryBig, hint: "Coming soon" },
    { label: "Riwayat", value: "0", icon: History, hint: "Lihat riwayat", to: "/history" },
    { label: "Plan", value: user?.plan ?? "Free", icon: TrendingUp, hint: "Upgrade tersedia" },
  ];

  return (
    <AppShell
      title={`Halo, ${user?.name?.split(" ")[0] ?? "kreator"} 👋`}
      subtitle="Mulai membuat prompt AI image profesional Anda hari ini."
    >
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-premium sm:p-8">
        <div className="absolute inset-0 bg-grid-soft opacity-20" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Badge className="rounded-full bg-white/15 text-white hover:bg-white/25">
              <Sparkles className="mr-1 h-3 w-3" /> Quick start
            </Badge>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Generate prompt profesional dalam &lt; 30 detik</h2>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Pilih jenis konten, isi topik, dan biarkan PromptStudio menyusun prompt detail untuk AI image favorit Anda.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/generator" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-elevated transition-transform hover:scale-[1.02]">
                <Wand2 className="h-4 w-4" /> Buka Generator
              </Link>
              <Link to="/templates" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
                <LibraryBig className="h-4 w-4" /> Lihat Template
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Carousel", "Poster", "Banner", "Infografis"].map((t) => (
              <div key={t} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <Zap className="h-4 w-4 opacity-80" />
                <p className="mt-3 text-sm font-semibold">{t}</p>
                <p className="text-[11px] text-white/70">Siap pakai</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const CardContent = (
            <>
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] text-muted-foreground">{s.hint}</span>
              </div>
              <p className="mt-4 text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </>
          );
          
          return s.to ? (
            <Link key={s.label} to={s.to as any} className="rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated block">
              {CardContent}
            </Link>
          ) : (
            <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
              {CardContent}
            </div>
          );
        })}
      </div>

      {/* Recent activity + templates */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h3 className="truncate text-base font-semibold">Aktivitas terbaru</h3>
            <Link to="/history" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Semua Riwayat <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-6 grid place-items-center rounded-2xl border border-dashed bg-surface-muted/50 p-10 text-center">
            <History className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Buka Halaman Riwayat</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Lihat seluruh daftar prompt yang pernah Anda hasilkan.
            </p>
            <Link to="/history" className="mt-4">
              <Button variant="outline" size="sm">Lihat Riwayat</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Template populer</h3>
            <Link to="/templates" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {featured.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border bg-surface-muted/40 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.style} · {t.slides} slide · {t.audience}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
