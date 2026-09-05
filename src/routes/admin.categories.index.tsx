import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCategories, deleteAdminCategory } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, Trash2, Plus, Tags } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories/")({
  component: CategoriesGrid,
});

function CategoriesGrid() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Kategori dihapus");
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus kategori"),
  });

  // Client-side pagination
  const categoryList = categories || [];
  const totalPages = Math.ceil(categoryList.length / limit);
  const currentCategories = categoryList.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Daftar Kategori</h3>
        <Link to="/admin/categories/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : currentCategories.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl">
          <Tags className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">Belum ada kategori.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCategories.map((c) => (
              <div key={c.id} className="border rounded-xl p-5 bg-card flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    {c.icon || "Folder"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {c.description || "Tidak ada deskripsi"}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Urutan: {c.order}</span>
                  <div className="flex gap-2">
                    <Link to={`/admin/categories/${c.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Hapus kategori '${c.name}'?`)) {
                          deleteMutation.mutate(c.id);
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
