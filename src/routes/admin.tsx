import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (user.role !== "admin") {
        toast.error("Akses ditolak: Hanya untuk Admin");
        navigate({ to: "/dashboard" });
      }
    }
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat Admin Panel…
        </div>
      </div>
    );
  }

  return <Outlet />;
}
