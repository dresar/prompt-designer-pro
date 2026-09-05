import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../contexts/auth-context";
import { ThemeProvider } from "../contexts/theme-context";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          URL yang Anda buka tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elevated transition-transform hover:scale-[1.02]"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Halaman ini gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Terjadi kesalahan. Coba muat ulang halaman.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-elevated"
          >
            Coba lagi
          </button>
          <a href="/" className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
            Ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PromptStudio AI — Generate Prompt Profesional untuk AI Image" },
      { name: "description", content: "Platform untuk membuat prompt AI image super detail — poster, banner, infografis, carousel edukasi, dan desain profesional lainnya." },
      { name: "author", content: "PromptStudio AI" },
      { property: "og:title", content: "PromptStudio AI" },
      { property: "og:description", content: "Generate prompt AI image profesional untuk ChatGPT Image, Gemini, Grok, dan lainnya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
