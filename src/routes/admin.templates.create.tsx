import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCategories, createAdminTemplate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/templates/create")({
  component: CreateTemplatePage,
});

function CreateTemplatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [globalPrompt, setGlobalPrompt] = useState(""); // Base prompt
  const [categoryId, setCategoryId] = useState("");
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");
  const [slides, setSlides] = useState("1");
  const [contentType, setContentType] = useState("Carousel Edukasi");
  const [language, setLanguage] = useState("id");
  const [output, setOutput] = useState("prompt");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  // Dynamic slide prompts
  const [slidePrompts, setSlidePrompts] = useState<string[]>([""]);

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => createAdminTemplate({
      title,
      description,
      globalPrompt,
      categoryId,
      style,
      audience,
      slides: parseInt(slides),
      contentType,
      language,
      output,
      isFeatured,
      isActive,
      slidePrompts: slidePrompts.filter(p => p.trim() !== ""), // Save as JSON
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast.success("Template berhasil ditambahkan");
      navigate({ to: "/admin/templates" });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menambahkan template"),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/templates">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Tambah Template Baru</h2>
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
            <div className="space-y-2">
              <Label>Tipe Konten</Label>
              <Input value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="Carousel, Infografis, dll" />
            </div>
            <div className="space-y-2">
              <Label>Bahasa Output</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue placeholder="Pilih Bahasa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipe Output</Label>
              <Select value={output} onValueChange={setOutput}>
                <SelectTrigger><SelectValue placeholder="Pilih Output" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prompt">Prompt Saja</SelectItem>
                  <SelectItem value="prompt+caption">Prompt + Caption</SelectItem>
                  <SelectItem value="prompt+json">Prompt + JSON</SelectItem>
                </SelectContent>
              </Select>
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
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || !title || !categoryId}
            className="gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Template
          </Button>
        </div>
      </div>
    </div>
  );
}
