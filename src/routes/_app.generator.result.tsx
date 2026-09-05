import { createFileRoute, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Download, FileJson, FileText, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import type { GeneratedPrompt, GeneratorInput } from "@/lib/prompt-engine";

export const Route = createFileRoute("/_app/generator/result")({
  component: ResultPage,
});

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract state from location
  const state = (location.state || {}) as { result?: GeneratedPrompt; input?: GeneratorInput };
  const { result, input } = state;

  useEffect(() => {
    // If no result is found in state, redirect back to generator
    if (!result) {
      navigate({ to: "/generator", replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  const copyText = async (text: string, label = "Prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} disalin`);
    } catch { toast.error("Gagal menyalin"); }
  };

  const download = (filename: string, content: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Hasil Prompt AI"
      subtitle={input?.topic ? `Topik: ${input.topic}` : "Berhasil di-generate"}
      actions={
        <Link to="/generator">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Form
          </Button>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Info Box untuk Konsistensi */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300">Penting untuk Konsistensi Hasil</h4>
            <p className="text-sm text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
              Untuk hasil terbaik dan konsisten di setiap slide, <strong>wajib copy dan paste blok Global Prompt (paragraf pertama)</strong> 
              di paling atas chat AI Anda (ChatGPT/Claude/dsb). Baru setelah itu Anda bisa mem-paste instruksi per-slide di bawahnya.
            </p>
          </div>
        </div>

        <section className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <h3 className="text-xl font-bold">Prompt Siap Digunakan</h3>
              {result.provider && !result.isDummy && (
                <Badge variant="outline" className="text-emerald-600 bg-emerald-50/50 border-emerald-200 ml-2">
                  via {result.provider}
                </Badge>
              )}
              {result.isDummy && (
                <Badge variant="secondary" className="rounded-full">Local Mode</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="default" className="rounded-xl bg-gradient-brand text-primary-foreground" onClick={() => copyText(result.prompt)}>
                <Copy className="mr-2 h-4 w-4" /> Copy Prompt
              </Button>
            </div>
          </div>

          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="rounded-xl mb-2 w-full justify-start overflow-x-auto">
              <TabsTrigger value="prompt" className="rounded-lg">Prompt Utama</TabsTrigger>
              {result.caption && <TabsTrigger value="caption" className="rounded-lg">Caption (Medsos)</TabsTrigger>}
              {result.json && <TabsTrigger value="json" className="rounded-lg">Struktur JSON</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="prompt" className="mt-4 outline-none">
              <div className="relative group">
                <pre className="min-h-[300px] max-h-[600px] overflow-auto whitespace-pre-wrap rounded-2xl border bg-surface-muted/60 p-6 text-[13.5px] leading-relaxed font-mono">
                  {result.prompt}
                </pre>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => copyText(result.prompt)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {result.caption && (
              <TabsContent value="caption" className="mt-4 outline-none">
                <div className="relative group">
                  <pre className="min-h-[300px] max-h-[600px] overflow-auto whitespace-pre-wrap rounded-2xl border bg-surface-muted/60 p-6 text-[13.5px] leading-relaxed font-mono">
                    {result.caption}
                  </pre>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => copyText(result.caption, "Caption")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
            
            {result.json && (
              <TabsContent value="json" className="mt-4 outline-none">
                <div className="relative group">
                  <pre className="min-h-[300px] max-h-[600px] overflow-auto whitespace-pre-wrap rounded-2xl border bg-surface-muted/60 p-6 text-[13.5px] leading-relaxed font-mono">
                    {JSON.stringify(result.json, null, 2)}
                  </pre>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => copyText(JSON.stringify(result.json, null, 2), "JSON")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Download file untuk backup atau integrasi sistem lain.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => download(`promptstudio-${Date.now()}.txt`, result.prompt)}>
                <FileText className="mr-2 h-4 w-4" /> Download TXT
              </Button>
              {result.json && (
                <Button variant="outline" className="rounded-xl" onClick={() => download(`promptstudio-${Date.now()}.json`, JSON.stringify(result.json, null, 2), "application/json")}>
                  <FileJson className="mr-2 h-4 w-4" /> Download JSON
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
