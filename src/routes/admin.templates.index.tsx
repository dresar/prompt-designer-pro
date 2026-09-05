import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminTemplates, deleteAdminTemplate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit2, Trash2, Plus, LibraryBig } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/templates/")({
  component: TemplatesGrid,
});

function TemplatesGrid() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin", "templates", page],
    queryFn: () => getAdminTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast.success("Template dihapus");
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus template"),
  });

  // Client-side pagination if backend doesn't support it yet
  const templateList = Array.isArray(templates) ? templates : (templates?.data || []);
  const totalPages = Math.ceil(templateList.length / limit);
  const currentTemplates = templateList.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Daftar Template</h3>
        <Link to="/admin/templates/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Template
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : currentTemplates.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl">
          <LibraryBig className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">Belum ada template.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentTemplates.map((t) => (
              <div key={t.id} className="border rounded-xl p-5 bg-card flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{t.category?.name || "Uncategorized"}</Badge>
                      {t.isPremium && <Badge variant="default" className="bg-gradient-brand">Pro</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1">{t.title}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {t.description || "Tidak ada deskripsi"}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t.slides} Slides</span>
                  <span>{t.style}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(t.createdAt), "dd MMM yyyy")}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/admin/templates/${t.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Hapus template '${t.title}'?`)) {
                          deleteMutation.mutate(t.id);
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
