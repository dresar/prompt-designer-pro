import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAdminApiKey } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/api-keys/create")({
  component: CreateApiKeyPage,
});

function CreateApiKeyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [provider, setProvider] = useState("gemini");
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [modelsInput, setModelsInput] = useState("");

  const createMutation = useMutation({
    mutationFn: () => {
      const modelsList = modelsInput.split(',').map(s => s.trim()).filter(Boolean);
      return addAdminApiKey(provider, label, key, modelsList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      toast.success("API Key berhasil ditambahkan");
      navigate({ to: "/admin/api-keys" });
    },
    onError: (err: any) => toast.error(err.message || "Gagal menambahkan API Key"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/api-keys">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Tambah API Key</h2>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">

        <div className="space-y-2">
          <Label>Provider AI</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="groq">Groq (Llama, Mixtral)</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Label / Nama Alias</Label>
          <Input 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            placeholder="Contoh: Akun Utama 1" 
          />
        </div>
        
        <div className="space-y-2">
          <Label>API Key (Rahasia)</Label>
          <Input 
            value={key} 
            onChange={(e) => setKey(e.target.value)} 
            type="password" 
            placeholder="sk-..." 
          />
        </div>

        <div className="space-y-2">
          <Label>Model AI (Opsional)</Label>
          <Input 
            value={modelsInput} 
            onChange={(e) => setModelsInput(e.target.value)} 
            placeholder="gemini-1.5-pro, gemini-1.5-flash (pisahkan dengan koma)" 
          />
          <p className="text-xs text-muted-foreground">Jika dikosongkan, akan menggunakan default model dari provider.</p>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link to="/admin/api-keys">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={createMutation.isPending || !label || !key}
            className="gap-2"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Key
          </Button>
        </div>
      </div>
    </div>
  );
}
