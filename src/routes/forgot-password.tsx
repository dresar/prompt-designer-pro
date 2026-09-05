import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Lupa Password · PromptStudio AI" }, { name: "description", content: "Reset password akun PromptStudio AI Anda." }] }),
  component: ForgotPage,
});

const schema = z.object({ email: z.string().email("Email tidak valid") });
type FormValues = z.infer<typeof schema>;

function ForgotPage() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (v: FormValues) => {
    setLoading(true);
    try {
      await forgotPassword(v.email);
      setSent(true);
      toast.success("Email reset password telah dikirim");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell
      title="Lupa password?"
      subtitle="Masukkan email Anda — kami akan mengirim tautan reset password."
      footer={<>Ingat password? <Link to="/login" className="font-semibold text-primary hover:underline">Kembali ke login</Link></>}
    >
      {sent ? (
        <div className="rounded-2xl border bg-accent/30 p-5 text-sm">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="mt-2 font-semibold">Email terkirim</p>
          <p className="mt-1 text-muted-foreground">Cek inbox Anda untuk instruksi reset password. Tautan akan kedaluwarsa dalam 1 jam.</p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="anda@email.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground shadow-elevated" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Tautan Reset
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
