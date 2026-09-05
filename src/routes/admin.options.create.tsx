import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminOption } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/options/create")({
  component: CreateOptionPage,
});

function CreateOptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [type, setType] = useState("contentType");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [order, setOrder] = useState("1");

  const createMutation = useMutation({
    mutationFn: () => createAdminOption({ type, label, value, order: Number(order) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "options"] });
      toast.success("Opsi berhasil ditambahkan");
      navigate({ to: "/admin/options" });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menambahkan opsi"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/options">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Tambah Opsi Baru</h2>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipe Opsi</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contentType">Jenis Konten</SelectItem>
              <SelectItem value="style">Gaya Desain</SelectItem>
              <SelectItem value="audience">Target Pembaca</SelectItem>
              <SelectItem value="language">Bahasa</SelectItem>
              <SelectItem value="output">Output</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Label (Tampil di UI)</label>
          <Input 
            placeholder="Contoh: Carousel Edukasi" 
            value={label} 
            onChange={e => setLabel(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Value (Nilai sebenarnya / Prompt)</label>
          <Input 
            placeholder="Contoh: Carousel Edukasi" 
            value={value} 
            onChange={e => setValue(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Urutan (Angka)</label>
          <Input 
            type="number" 
            value={order} 
            onChange={e => setOrder(e.target.value)} 
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link to="/admin/options">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || !label || !value}
            className="gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Opsi
          </Button>
        </div>
      </div>
    </div>
  );
}
