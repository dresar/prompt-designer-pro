import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOptions, deleteAdminOption, updateAdminOption } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit2, Trash2, Plus, ListFilter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/options/")({
  component: OptionsGrid,
});

function OptionsGrid() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("all");
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "options", type, page],
    queryFn: () => getAdminOptions(type === "all" ? undefined : type, page, limit),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateAdminOption(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "options"] });
      toast.success("Status opsi diperbarui");
    },
    onError: (err: any) => toast.error(err.message || "Gagal mengubah status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "options"] });
      toast.success("Opsi dihapus");
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus opsi"),
  });

  const optionList = Array.isArray(data) ? data : (data?.data || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-muted-foreground" />
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="contentType">Jenis Konten</SelectItem>
                <SelectItem value="style">Gaya Desain</SelectItem>
                <SelectItem value="audience">Target Pembaca</SelectItem>
                <SelectItem value="language">Bahasa</SelectItem>
                <SelectItem value="output">Output</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Link to="/admin/options/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Opsi
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : !optionList || optionList.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl">
          <p className="text-muted-foreground">Belum ada opsi untuk tipe ini.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {optionList.map((opt) => (
              <div key={opt.id} className="border rounded-xl p-5 bg-card flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">{opt.type}</Badge>
                    <h3 className="font-semibold text-lg">{opt.label}</h3>
                  </div>
                  <Switch 
                    checked={opt.isActive} 
                    onCheckedChange={(c) => toggleMutation.mutate({ id: opt.id, isActive: c })}
                    disabled={toggleMutation.isPending}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                  {opt.value}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Urutan: {opt.order}</span>
                  <div className="flex gap-2">
                    <Link to={`/admin/options/${opt.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Hapus opsi '${opt.label}'?`)) {
                          deleteMutation.mutate(opt.id);
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

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button 
                variant="outline" 
                disabled={!data.meta.hasPrevPage}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm font-medium">
                Halaman {data.meta.page} dari {data.meta.totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={!data.meta.hasNextPage}
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
