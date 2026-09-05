import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Daftar · PromptStudio AI" }, { name: "description", content: "Buat akun PromptStudio AI gratis." }] }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type FormValues = z.infer<typeof schema>;

function RegisterPage() {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      await registerUser(v.name, v.email, v.password);
      toast.success("Akun berhasil dibuat!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mendaftar");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell
      title="Mulai gratis hari ini"
      subtitle="Buat akun dan dapatkan akses ke semua template & generator."
      footer={<>Sudah punya akun? <Link to="/login" className="font-semibold text-primary hover:underline">Masuk</Link></>}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input id="name" placeholder="Nama Anda" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="anda@email.com" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Minimal 6 karakter" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground shadow-elevated hover:opacity-95" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buat Akun
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Dengan mendaftar, Anda menyetujui Syarat & Kebijakan Privasi kami.
        </p>
      </form>
    </AuthShell>
  );
}
