import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getTemplates, getPublicSettings } from "@/lib/api-client";

export const Route = createFileRoute("/_app/templates/")({
  head: () => ({ meta: [{ title: "Template Library · PromptStudio AI" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("All");

  const { data: templatesRes, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => getTemplates(),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: getPublicSettings,
  });

  const templates = templatesRes?.data || [];
  const imageKitUrl = (settingsRes?.data?.["imagekit.urlEndpoint"] as string) || "";

  const categories = useMemo(() => {
    const cats = templates.map((t) => t.category?.name).filter(Boolean) as string[];
    return ["All", ...Array.from(new Set(cats))];
  }, [templates]);

  const filtered = useMemo(() => templates.filter((t) => {
    const matchesQ = !q || `${t.title} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase());
    const tCategory = t.category?.name || "Uncategorized";
    const matchesC = category === "All" || tCategory === category;
    return matchesQ && matchesC;
  }), [templates, q, category]);

  return (
    <AppShell
      title="Template Library"
      subtitle="Mulai dari template terkurasi — semua form otomatis terisi."
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-soft">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari template (HTTP, Docker, OAuth…)"
            className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-self-start sm:justify-self-end">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                category === c ? "border-primary bg-gradient-brand text-white shadow-elevated" : "bg-card hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed bg-surface-muted/50 p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Tidak ada template ditemukan</p>
          <p className="mt-1 text-xs text-muted-foreground">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link key={t.id} to={`/templates/${t.slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-brand">
                {t.thumbnail && imageKitUrl ? (
                  <img src={`${imageKitUrl}${t.thumbnail}`} alt={t.title} className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60 transition-transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-grid-soft opacity-25" />
                )}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white z-10">
                  <Badge className="self-start rounded-full bg-white/15 text-[10px] backdrop-blur-md hover:bg-white/25">
                    {t.category?.name || "Template"}
                  </Badge>
                  <p className="text-lg font-bold leading-tight drop-shadow-md">{t.title}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="rounded-full text-[10px]">{t.slides} slide</Badge>
                  <Badge variant="secondary" className="rounded-full text-[10px]">{t.style}</Badge>
                  <Badge variant="secondary" className="rounded-full text-[10px]">{t.audience}</Badge>
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="secondary" className="w-full rounded-xl bg-secondary text-primary hover:bg-secondary/80">
                    Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
