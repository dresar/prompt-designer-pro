import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminCategory } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/categories/create")({
  component: CreateCategoryPage,
});

function CreateCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState("0");

  const createMutation = useMutation({
    mutationFn: () => createAdminCategory({ name, description, icon, order: parseInt(order) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Kategori berhasil ditambahkan");
      navigate({ to: "/admin/categories" });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menambahkan kategori"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/categories">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Tambah Kategori Baru</h2>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">
        <div className="space-y-2">
          <Label>Nama Kategori</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Social Media" />
        </div>
        
        <div className="space-y-2">
          <Label>Deskripsi</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Icon (Teks/Emoji)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Misal: 🌟" />
          </div>
          <div className="space-y-2">
            <Label>Urutan</Label>
            <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link to="/admin/categories">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || !name}
            className="gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Kategori
          </Button>
        </div>
      </div>
    </div>
  );
}
