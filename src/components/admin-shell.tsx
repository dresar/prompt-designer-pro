import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, KeyRound, LibraryBig, Tags, Users, Settings,
  LogOut, Menu, X, Search, ShieldCheck, Sun, Moon
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const adminNav = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/admin/templates", label: "Templates", icon: LibraryBig },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/options", label: "Setting Prompt", icon: Settings },
  { to: "/admin/users", label: "Users", icon: Users },
] as const;

export function AdminShell({ children, title, subtitle, actions }: { children: ReactNode; title?: string; subtitle?: string; actions?: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const initials = (user?.name ?? "A").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const SidebarBody = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">ADMIN</span>
        </div>
        <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Admin Panel</p>
        {adminNav.map((item) => {
          const active = pathname === item.to || (item.to !== "/admin/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
          <LogOut className="h-4 w-4 rotate-180" /> Kembali ke App
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar lg:block">
        {SidebarBody}
      </aside>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar shadow-premium lg:hidden">
            {SidebarBody}
          </aside>
        </>
      )}

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground lg:ml-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium hidden sm:inline">Administrator Mode</span>
          </div>

          <div className="flex items-center gap-2 justify-self-end">
            <Button size="icon" variant="ghost" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2 rounded-full border bg-card px-1.5 py-1 pr-3 ml-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[11px] text-white">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
