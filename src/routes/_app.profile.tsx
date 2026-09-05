import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, LogOut, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile · PromptStudio AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const onSave = () => {
    updateProfile({ name, email });
    setEditing(false);
    toast.success("Profil diperbarui");
  };

  const onLogout = () => { logout(); navigate({ to: "/login" }); };

  return (
    <AppShell title="Profile" subtitle="Kelola informasi akun dan paket Anda.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl border bg-card p-6 text-center shadow-soft">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full bg-gradient-brand blur-xl opacity-40" />
            <Avatar className="relative h-24 w-24 border-4 border-background shadow-elevated">
              <AvatarFallback className="bg-gradient-brand text-2xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="mt-4 text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Badge className="mt-3 rounded-full bg-gradient-brand text-white hover:opacity-95">
            Paket {user?.plan}
          </Badge>
          <div className="mt-6 grid gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
            <Button variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="text-base font-semibold">Informasi akun</h3>
          <p className="text-xs text-muted-foreground">Perbarui detail dasar profil Anda.</p>
          <div className="mt-5 grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama lengkap</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} className="rounded-xl pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Paket saat ini</Label>
              <div className="flex items-center justify-between rounded-xl border bg-surface-muted/40 p-4">
                <div>
                  <p className="text-sm font-semibold">{user?.plan}</p>
                  <p className="text-xs text-muted-foreground">Akses fitur generator & template library.</p>
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">Upgrade Soon</Badge>
              </div>
            </div>

            {editing && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={onSave} className="rounded-xl bg-gradient-brand text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Simpan
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => { setEditing(false); setName(user?.name ?? ""); setEmail(user?.email ?? ""); }}
                >
                  <X className="mr-2 h-4 w-4" /> Batal
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
