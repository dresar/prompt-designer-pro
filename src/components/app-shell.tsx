import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Wand2, LibraryBig, User, Settings as SettingsIcon,
  History, BarChart3, KeyRound, CreditCard, Users2, Store, ShieldCheck,
  LogOut, Menu, X, Bell, Search, Moon, Sun,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generator", label: "Prompt Generator", icon: Wand2 },
  { to: "/templates", label: "Template Library", icon: LibraryBig },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
  { to: "/history", label: "History", icon: History },
] as const;

const comingSoon = [
  { label: "Analytics", icon: BarChart3 },
  { label: "API Provider", icon: KeyRound },
  { label: "Subscription", icon: CreditCard },
  { label: "Team Workspace", icon: Users2 },
  { label: "Marketplace", icon: Store },
  { label: "Admin Panel", icon: ShieldCheck },
] as const;

export function AppShell({ children, title, subtitle, actions }: { children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const SidebarBody = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between px-2">
        <Logo />
        <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-1">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
        {mainNav.map((item) => {
          const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-brand text-primary-foreground shadow-elevated"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="mt-6 flex flex-col gap-1">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Coming Soon</p>
        {comingSoon.filter(i => i.label !== "Admin Panel").map((item) => (
          <div key={item.label} className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/80 hover:bg-sidebar-accent/50">
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4 opacity-70" />
              {item.label}
            </span>
            <Badge variant="secondary" className="rounded-full bg-secondary px-2 py-0 text-[10px] font-medium text-secondary-foreground">Soon</Badge>
          </div>
        ))}
        {user?.role === "admin" && (
          <Link
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground hover:bg-sidebar-accent mt-2"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-primary font-bold">Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="mt-auto rounded-2xl border bg-gradient-to-br from-primary to-primary-glow p-4 text-primary-foreground shadow-elevated">
        <p className="text-xs font-medium opacity-80">Upgrade ke Pro</p>
        <p className="mt-1 text-sm font-semibold">Unlock unlimited prompt + API integration</p>
        <Badge className="mt-3 rounded-full bg-white/20 text-white hover:bg-white/30">Coming Soon</Badge>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-sidebar lg:block">
        {SidebarBody}
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar shadow-premium lg:hidden">
            {SidebarBody}
          </aside>
        </>
      )}

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 items-center gap-2 rounded-xl border bg-surface-muted px-3 py-2 text-sm text-muted-foreground sm:flex md:max-w-md">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Cari template, prompt, atau pengaturan…</span>
          </div>
          <div className="flex items-center gap-2 justify-self-end">
            <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" aria-label="Notifikasi">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 rounded-full border bg-card px-1.5 py-1 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-brand text-[11px] text-white">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            </div>
            <Button size="icon" variant="ghost" aria-label="Logout" onClick={() => { logout(); navigate({ to: "/login" }); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {(title || actions) && (
            <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                {title && <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
