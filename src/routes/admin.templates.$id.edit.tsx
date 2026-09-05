import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCategories, getAdminTemplate, updateAdminTemplate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/templates/$id/edit")({
  component: EditTemplatePage,
});

function EditTemplatePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");
  const [slides, setSlides] = useState("1");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [slidePrompts, setSlidePrompts] = useState<string[]>([]);

  const { data: template, isLoading } = useQuery({
    queryKey: ["admin", "template", id],
    queryFn: () => getAdminTemplate(id),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });

  useEffect(() => {
    if (template?.data) {
      const t = template.data;
      setTitle(t.title);
      setDescription(t.description || "");
      setGlobalPrompt(t.globalPrompt || "");
      setCategoryId(t.categoryId || "");
      setStyle(t.style || "");
      setAudience(t.audience || "");
      setSlides(String(t.slides));
      setIsFeatured(t.isFeatured);
      setIsActive(t.isActive);
      if (t.slidePrompts && Array.isArray(t.slidePrompts)) {
        setSlidePrompts(t.slidePrompts);
      }
    }
  }, [template]);

  const updateMutation = useMutation({
    mutationFn: () => updateAdminTemplate(id, {
      title,
      description,
      globalPrompt,
      categoryId,
      style,
      audience,
      slides: parseInt(slides),
      isFeatured,
      isActive,
      slidePrompts: slidePrompts.filter(p => p.trim() !== ""),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "template", id] });
      toast.success("Template berhasil diperbarui");
      navigate({ to: "/admin/templates" });
    },
    onError: (err: any) => toast.error(err.message || "Gagal memperbarui template"),
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/templates">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Edit Template</h2>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-8 shadow-sm">
        {/* Info Dasar */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Informasi Dasar</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Judul Template *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Banner Instagram" />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi Singkat</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cocok untuk jualan online..." />
          </div>
        </section>

        {/* Setting Default */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Pengaturan Default</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Style Default</Label>
              <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Minimalist, 3D, dll" />
            </div>
            <div className="space-y-2">
              <Label>Target Audiens</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Anak muda, profesional" />
            </div>
            <div className="space-y-2">
              <Label>Jumlah Slide Visual</Label>
              <Input type="number" min="1" value={slides} onChange={(e) => setSlides(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Prompts */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Konfigurasi Prompt</h3>
          
          <div className="space-y-2">
            <Label>Prompt Dasar (Global)</Label>
            <Textarea 
              value={globalPrompt} 
              onChange={(e) => setGlobalPrompt(e.target.value)} 
              placeholder="Instruksi global untuk AI..." 
              className="h-24"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label>Slide Prompts (Opsional - Prompt spesifik per slide)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setSlidePrompts([...slidePrompts, ""])}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Prompt Slide
              </Button>
            </div>
            
            {slidePrompts.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="bg-muted px-3 py-2 rounded text-sm font-medium mt-1">
                  #{i + 1}
                </div>
                <Textarea 
                  value={p}
                  onChange={(e) => {
                    const newPrompts = [...slidePrompts];
                    newPrompts[i] = e.target.value;
                    setSlidePrompts(newPrompts);
                  }}
                  placeholder={`Instruksi khusus untuk slide ${i + 1}...`}
                  className="min-h-[60px]"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 mt-1"
                  onClick={() => setSlidePrompts(slidePrompts.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Akses & Status */}
        <section className="flex gap-6 py-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
            <Label htmlFor="featured">Tandai sebagai Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
            <Label htmlFor="active">Template Aktif</Label>
          </div>
        </section>

        <div className="pt-4 flex justify-end gap-3">
          <Link to="/admin/templates">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button 
            onClick={() => updateMutation.mutate()} 
            disabled={updateMutation.isPending || !title || !categoryId}
            className="gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
