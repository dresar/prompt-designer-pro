import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PromptStudio AI · <Link to="/" className="hover:text-foreground">Beranda</Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-brand lg:block">
        <div className="absolute inset-0 bg-grid-soft opacity-20" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Premium Prompt Engine
            </span>
            <h2 className="mt-6 text-4xl font-bold leading-tight">
              Buat prompt AI image<br />yang terlihat profesional.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Bergabung dengan kreator yang menggunakan PromptStudio untuk menghasilkan carousel, infografis, dan poster dengan kualitas desain premium.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { icon: Zap, text: "Generate prompt dalam hitungan detik" },
              { icon: ShieldCheck, text: "Guardrail anti-AI-look bawaan" },
              { icon: Sparkles, text: "Output siap pakai: TXT, JSON, Caption" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
