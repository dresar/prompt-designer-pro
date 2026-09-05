import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Monitor, Bell, Globe, Palette, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { useState } from "react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · PromptStudio AI" }] }),
  component: SettingsPage,
});

const THEME_COLORS = [
  { name: "Navy", value: "#0B3D91" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#22C55E" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Pink", value: "#EC4899" },
  { name: "Amber", value: "#F59E0B" },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = useState("#0B3D91");
  const [language, setLanguage] = useState("id");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  return (
    <AppShell title="Settings" subtitle="Sesuaikan tampilan, bahasa, dan preferensi notifikasi.">
      <div className="grid gap-6">
        <Section icon={Palette} title="Tampilan" desc="Pilih tema yang nyaman untuk mata Anda.">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((opt) => {
              const active = (opt.id === "system" ? false : theme === opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (opt.id === "system") {
                      const mq = window.matchMedia("(prefers-color-scheme: dark)");
                      setTheme(mq.matches ? "dark" : "light");
                    } else setTheme(opt.id as "light" | "dark");
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active ? "border-primary bg-secondary shadow-elevated" : "bg-card hover:bg-muted"
                  }`}
                >
                  <opt.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">Mode {opt.label.toLowerCase()}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <Label className="text-sm">Warna tema</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {THEME_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setAccent(c.value); toast.success(`Warna ${c.name} dipilih (preview)`); }}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
                    accent === c.value ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ background: c.value }}
                  aria-label={c.name}
                />
              ))}
              <Badge variant="secondary" className="ml-2 self-center rounded-full text-[10px]">Coming Soon</Badge>
            </div>
          </div>
        </Section>

        <Section icon={Globe} title="Bahasa" desc="Pilih bahasa antarmuka aplikasi.">
          <div className="max-w-xs">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section icon={Bell} title="Notifikasi" desc="Kelola bagaimana Anda menerima pembaruan.">
          <Row title="Email notifikasi" desc="Update penting tentang akun & layanan.">
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </Row>
          <Row title="Produk & promo" desc="Berita fitur baru dan penawaran khusus.">
            <Switch checked={notifProduct} onCheckedChange={setNotifProduct} />
          </Row>
        </Section>

        <Section icon={Lock} title="Keamanan" desc="Pengaturan keamanan akun Anda.">
          <Row title="Ubah password" desc="Perbarui password akun secara berkala.">
            <Badge variant="secondary" className="rounded-full text-[10px]">Coming Soon</Badge>
          </Row>
          <Row title="Autentikasi dua faktor" desc="Tambahkan lapisan keamanan ekstra.">
            <Badge variant="secondary" className="rounded-full text-[10px]">Coming Soon</Badge>
          </Row>
        </Section>

        <Section icon={Trash2} title="Zona berbahaya" desc="Tindakan ini tidak dapat dibatalkan." danger>
          <Row title="Hapus akun" desc="Hapus permanen seluruh data dan riwayat prompt.">
            <Button variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" disabled>
              Hapus
            </Button>
          </Row>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ icon: Icon, title, desc, children, danger }: { icon: React.ElementType; title: string; desc: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-3xl border bg-card p-6 shadow-soft ${danger ? "border-destructive/30" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${danger ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-surface-muted/40 p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
