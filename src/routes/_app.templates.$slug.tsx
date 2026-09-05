import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Loader2, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getTemplateBySlug, getPublicSettings } from "@/lib/api-client";

export const Route = createFileRoute("/_app/templates/$slug")({
  component: TemplateDetailPage,
});

function TemplateDetailPage() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { slug } = useParams({ from: "/_app/templates/$slug" });

  const { data: templateRes, isLoading } = useQuery({
    queryKey: ["templates", slug],
    queryFn: () => getTemplateBySlug(slug),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: getPublicSettings,
  });

  const template = templateRes as any;
  const imageKitUrl = (settingsRes?.data?.["imagekit.urlEndpoint"] as string) || "";

  const applyTemplate = () => {
    setShowPrompt(true);
  };

  if (isLoading) {
    return (
      <AppShell title="Memuat Template..." subtitle="Tunggu sebentar.">
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!template) {
    return (
      <AppShell title="Template Tidak Ditemukan" subtitle="Mungkin sudah dihapus atau slug salah.">
        <Link to="/templates">
          <Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/> Kembali ke Library</Button>
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={template.title}
      subtitle={template.category?.name || "Template"}
      actions={
        <Link to="/templates">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
      }
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Banner Image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gradient-brand shadow-soft">
          {template.thumbnail && imageKitUrl ? (
            <img 
              src={`${imageKitUrl}${template.thumbnail}`} 
              alt={template.title} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-grid-soft opacity-50">
              <Sparkles className="h-16 w-16 text-white/30" />
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          {/* Main Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Tentang Template Ini</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {template.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {template.tags && template.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Specs */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold mb-4">Spesifikasi Prompt</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Tipe Konten</span>
                  <span className="font-medium">{template.contentType}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Gaya Visual</span>
                  <span className="font-medium">{template.style}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Target Pembaca</span>
                  <span className="font-medium">{template.audience}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Jumlah Slide</span>
                  <span className="font-medium">{template.slides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bahasa Output</span>
                  <span className="font-medium uppercase">{template.language}</span>
                </div>
              </div>

              <Button onClick={applyTemplate} className="w-full mt-6 h-12 rounded-xl bg-gradient-brand text-primary-foreground shadow-premium hover:opacity-95">
                <Play className="mr-2 h-4 w-4" /> Lihat Prompting
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Prompt: {template.title}</DialogTitle>
            <DialogDescription>Prompt instruksi dari template ini</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {template.globalPrompt && (
              <div>
                <h4 className="font-semibold mb-2">Global Prompt</h4>
                <div className="rounded-md bg-muted p-4 whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                  {template.globalPrompt}
                </div>
              </div>
            )}
            
            {template.slidePrompts && Object.keys(template.slidePrompts).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Slide Prompts</h4>
                <div className="space-y-4">
                  {Object.entries(template.slidePrompts).map(([slide, prompt]) => (
                    <div key={slide} className="rounded-md border p-4 bg-card">
                      <div className="font-medium mb-2 text-xs uppercase tracking-wider text-primary">{slide}</div>
                      <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                        {String(prompt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
