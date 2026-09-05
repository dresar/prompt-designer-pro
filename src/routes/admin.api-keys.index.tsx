import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminApiKeys, toggleAdminApiKey, deleteAdminApiKey, testAdminApiKey } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Plus, KeyRound, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/api-keys/")({
  component: ApiKeysGrid,
});

function ApiKeysGrid() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: keys, isLoading } = useQuery({
    queryKey: ["admin", "api-keys"],
    queryFn: getAdminApiKeys,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleAdminApiKey(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      toast.success("Status diubah");
    },
    onError: (err: any) => toast.error(err.message || "Gagal mengubah status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      toast.success("API Key dihapus");
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus API Key"),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => testAdminApiKey(id),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      toast.success(res.message || "Test berhasil!");
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      toast.error(err.message || "Test gagal");
    },
  });

  // Client-side pagination and sorting
  // Sort: errorCount > 0 keys go to the bottom
  const keysList = [...(keys || [])].sort((a, b) => {
    if (a.errorCount > 0 && b.errorCount === 0) return 1;
    if (a.errorCount === 0 && b.errorCount > 0) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const totalPages = Math.ceil(keysList.length / limit);
  const currentKeys = keysList.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Daftar API Key</h3>
        <Link to="/admin/api-keys/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah API Key
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : currentKeys.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl">
          <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">Belum ada API Key tersimpan.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentKeys.map((k) => (
              <div key={k.id} className={`border rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-all ${k.errorCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-card hover:shadow-md'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className={`mb-2 capitalize ${k.errorCount > 0 ? 'border-red-300 text-red-600' : ''}`}>{k.providerId || k.provider?.name}</Badge>
                    <h3 className="font-semibold text-lg line-clamp-1">{k.label}</h3>
                  </div>
                  <Switch 
                    checked={k.isActive} 
                    onCheckedChange={(c) => toggleMutation.mutate({ id: k.id, isActive: c })} 
                    disabled={toggleMutation.isPending}
                  />
                </div>
                
                {k.models && k.models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {k.models.map(m => (
                      <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium text-foreground">{k.requestCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span className={k.errorCount > 0 ? "text-red-600 font-bold" : "text-foreground font-medium"}>
                      {k.errorCount}
                    </span>
                  </div>
                  {k.lastError && (
                    <div className="text-xs text-red-500 mt-1 bg-red-100/50 p-2 rounded line-clamp-2">
                      {k.lastError}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(k.createdAt), "dd MMM yyyy")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={testMutation.isPending}
                      onClick={() => testMutation.mutate(k.id)}
                    >
                      {testMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
                      Test
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Hapus API Key '${k.label}'?`)) {
                          deleteMutation.mutate(k.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm font-medium">
                Halaman {page} dari {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
