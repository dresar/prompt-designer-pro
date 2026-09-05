import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth, DEMO_CREDENTIALS } from "@/contexts/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk · PromptStudio AI" }, { name: "description", content: "Masuk ke akun PromptStudio AI Anda." }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const { login, loginDemo, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    if (user) navigate({ to: user.role === "admin" ? "/admin/dashboard" : "/dashboard" }); 
  }, [user, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      const result = await login(v.email, v.password);
      toast.success("Berhasil masuk!");
      // Redirect admin to /admin/dashboard, users to /dashboard
      navigate({ to: result.role === "admin" ? "/admin/dashboard" : "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    form.setValue("email", DEMO_CREDENTIALS.email);
    form.setValue("password", DEMO_CREDENTIALS.password);
    toast.info("Kredensial Demo User telah diisi, silakan klik Masuk");
  };

  const handleAdminDemo = () => {
    form.setValue("email", "admin@promptstudio.ai");
    form.setValue("password", "admin123");
    toast.info("Kredensial Admin telah diisi, silakan klik Masuk");
  };

  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan membuat prompt profesional."
      footer={<>Belum punya akun? <Link to="/register" className="font-semibold text-primary hover:underline">Daftar gratis</Link></>}
    >
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDemo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary/80"
        >
          <Sparkles className="h-4 w-4" />
          Demo User
        </button>
        <button
          type="button"
          onClick={handleAdminDemo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/20"
        >
          <Sparkles className="h-4 w-4" />
          Demo Admin
        </button>
      </div>
      <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />ATAU<span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="anda@email.com" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Lupa password?</Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground shadow-elevated hover:opacity-95" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Masuk
        </Button>
      </form>

      <p className="mt-5 rounded-xl border bg-surface-muted p-3 text-xs text-muted-foreground">
        Demo: <span className="font-mono text-foreground">{DEMO_CREDENTIALS.email}</span> · <span className="font-mono text-foreground">{DEMO_CREDENTIALS.password}</span>
      </p>
    </AuthShell>
  );
}
