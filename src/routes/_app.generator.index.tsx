import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eraser, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePrompt, type GeneratedPrompt, type GeneratorInput } from "@/lib/prompt-engine";
import { consumePrefill } from "@/lib/generator-prefill";
import { useQuery } from "@tanstack/react-query";
import { getPublicOptions } from "@/lib/api-client";

export const Route = createFileRoute("/_app/generator/")({
  head: () => ({ meta: [{ title: "Prompt Generator · PromptStudio AI" }] }),
  component: GeneratorPage,
});

const DEFAULTS: GeneratorInput = {
  contentType: "Carousel Edukasi",
  topic: "",
  slides: 5,
  style: "Modern Technology",
  audience: "Developer",
  language: "id",
  output: "prompt+json",
};

function GeneratorPage() {
  const [input, setInput] = useState<GeneratorInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);

  const navigate = useNavigate();

  const { data: optionsData } = useQuery({
    queryKey: ["public", "options"],
    queryFn: getPublicOptions,
  });

  const options: Record<string, any[]> = optionsData || {
    contentType: [],
    style: [],
    audience: [],
    language: [
      { label: "Indonesia", value: "id" },
      { label: "English", value: "en" }
    ],
    output: [
      { label: "Prompt Text", value: "prompt" },
      { label: "Prompt + JSON", value: "prompt+json" }
    ]
  };

  // Ensure default language and output if not provided by backend
  const languages = options.language?.length ? options.language : [
    { label: "Indonesia", value: "id" },
    { label: "English", value: "en" }
  ];
  const outputs = options.output?.length ? options.output : [
    { label: "Prompt Text", value: "prompt" },
    { label: "Prompt + JSON", value: "prompt+json" }
  ];

  useEffect(() => {
    const pre = consumePrefill();
    if (pre) {
      setInput(pre);
      toast.success("Template diterapkan ke form");
    }
  }, []);

  const update = <K extends keyof GeneratorInput>(k: K, v: GeneratorInput[K]) => setInput((p) => ({ ...p, [k]: v }));

  const onGenerate = async () => {
    if (!input.topic.trim()) {
      toast.error("Mohon isi topik atau judul terlebih dahulu");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      // Try backend API first
      const { generatePromptAPI } = await import("@/lib/api-client");
      const apiResult = await generatePromptAPI({
        topic: input.topic,
        contentType: input.contentType,
        slides: input.slides,
        style: input.style,
        audience: input.audience,
        language: input.language,
        output: input.output,
      });
      const resultData = {
        prompt: apiResult.prompt,
        caption: apiResult.caption,
        json: apiResult.json,
        provider: apiResult.provider,
        isDummy: apiResult.isDummy,
      };
      
      if (apiResult.isDummy) {
        toast.info("Prompt dibuat secara lokal (tambahkan API Key di Admin Panel untuk AI)");
      } else {
        toast.success(`Prompt berhasil dibuat via ${apiResult.provider}`);
      }
      
      // Navigate to result page
      navigate({ to: "/generator/result", state: { result: resultData, input } });
    } catch (err) {
      // Fallback: use local engine if API is unavailable
      await new Promise((r) => setTimeout(r, 400));
      const localResult = generatePrompt(input);
      toast.success("Prompt berhasil dibuat (mode lokal)");
      navigate({ to: "/generator/result", state: { result: localResult, input } });
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => { setInput(DEFAULTS); };

  return (
    <AppShell
      title="Prompt Generator"
      subtitle="Susun prompt AI image super detail dalam beberapa klik."
      actions={
        <Button variant="outline" onClick={onClear} className="rounded-xl">
          <Eraser className="mr-2 h-4 w-4" /> Clear
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Form */}
        <section className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <div className="grid gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Jenis konten">
                <Select value={input.contentType} onValueChange={(v) => update("contentType", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.contentType?.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Judul / Tema" hint='Contoh: "HTTP vs HTTPS", "Session vs Cookie"'>
                <Input
                  value={input.topic}
                  onChange={(e) => update("topic", e.target.value)}
                  placeholder="Tulis topik Anda…"
                  className="rounded-xl"
                />
              </Field>
            </div>

            <Field label="Jumlah slide">
              <div className="flex flex-wrap gap-2">
                {[1, 3, 5, 8, 10, 15].map((s) => {
                  const active = input.slides === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update("slides", s)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                        active ? "border-primary bg-gradient-brand text-white shadow-elevated" : "bg-background hover:bg-muted"
                      }`}
                    >
                      {s} slide
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Gaya desain">
                <Select value={input.style} onValueChange={(v) => update("style", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{options.style?.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Target pembaca">
                <Select value={input.audience} onValueChange={(v) => update("audience", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{options.audience?.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bahasa">
                <Select value={input.language} onValueChange={(v) => update("language", v as "id" | "en")}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Output">
                <Select value={input.output} onValueChange={(v) => update("output", v as GeneratorInput["output"])}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{outputs.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <Button onClick={onGenerate} disabled={loading} className="mt-4 h-14 rounded-2xl bg-gradient-brand text-lg font-semibold text-primary-foreground shadow-premium hover:opacity-95">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Generate Prompt AI
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
