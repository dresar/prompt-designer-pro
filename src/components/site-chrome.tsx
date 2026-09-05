import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Github, Twitter, Linkedin, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Fitur</a>
          <a href="#how" className="transition-colors hover:text-foreground">Cara Kerja</a>
          <a href="#templates" className="transition-colors hover:text-foreground">Template</a>
          <a href="#cta" className="transition-colors hover:text-foreground">Harga</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin/dashboard" : "/generator"}>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-xl">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border shadow-sm">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to={user.role === "admin" ? "/admin/dashboard" : "/generator"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-[1.02]"
              >
                Mulai Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            PromptStudio AI membantu Anda membuat prompt AI image profesional untuk poster, banner, infografis, carousel, dan desain visual lainnya — hasilnya terlihat seperti dibuat desainer, bukan AI.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Produk</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Fitur</a></li>
            <li><a href="#templates" className="hover:text-foreground">Template</a></li>
            <li><Link to="/login" className="hover:text-foreground">Coba Demo</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Perusahaan</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Tentang</a></li>
            <li><a href="#" className="hover:text-foreground">Blog</a></li>
            <li><a href="#" className="hover:text-foreground">Kontak</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} PromptStudio AI. All rights reserved.</p>
          <p>Made with care for designers & developers.</p>
        </div>
      </div>
    </footer>
  );
}
