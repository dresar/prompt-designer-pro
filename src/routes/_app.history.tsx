import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History, Sparkles, Loader2, Play, FileText, Settings2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPromptHistory } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "Riwayat Prompt · PromptStudio AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // We'll just fetch page 1 for now. For a full implementation, pagination should be added.
  const { data: historyRes, isLoading } = useQuery({
    queryKey: ["history", 1],
    queryFn: () => getPromptHistory(1),
  });

  const historyItems = (historyRes as any)?.data || [];

  const handleReuse = (item: any) => {
    setSelectedItem(item);
  };

  return (
    <AppShell
      title="Riwayat Prompt"
      subtitle="Daftar prompt yang pernah Anda hasilkan sebelumnya."
    >
      {isLoading ? (
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed bg-surface-muted/50 p-12 text-center">
          <History className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Belum ada riwayat</p>
          <p className="mt-1 text-xs text-muted-foreground">Prompt yang Anda buat di Generator akan muncul di sini.</p>
          <Link to="/generator" className="mt-4">
            <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Mulai Generate</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {historyItems.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-start gap-4">
                <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1">
                    {item.title || "Tanpa Topik"}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Settings2 className="h-3 w-3" /> {item.contentType}
                    </span>
                    <span>&bull;</span>
                    <span>{item.slides} slide</span>
                    <span>&bull;</span>
                    <span className="capitalize">{item.style}</span>
                    <span>&bull;</span>
                    <span>{formatRelativeTime(new Date(item.createdAt))}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.isDummy ? (
                      <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">Mode Lokal</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">Generated</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] uppercase">{item.language}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:self-center self-end">
                <Button variant="secondary" size="sm" onClick={() => handleReuse(item)} className="rounded-xl">
                  <Play className="mr-2 h-3 w-3" /> Gunakan Lagi
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>Detail prompt yang dihasilkan</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Prompt</h4>
              <div className="rounded-md bg-muted p-4 whitespace-pre-wrap font-mono text-sm">
                {selectedItem?.promptText}
              </div>
            </div>
            {selectedItem?.captionText && (
              <div>
                <h4 className="font-semibold mb-2">Caption</h4>
                <div className="rounded-md bg-muted p-4 whitespace-pre-wrap font-mono text-sm">
                  {selectedItem.captionText}
                </div>
              </div>
            )}
            {selectedItem?.jsonData && (
              <div>
                <h4 className="font-semibold mb-2">JSON Data</h4>
                <div className="rounded-md bg-muted p-4 whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(selectedItem.jsonData, null, 2)}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
