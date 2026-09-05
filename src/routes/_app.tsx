import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { getTemplates, getPublicOptions, getPublicSettings, getPromptHistory } from "@/lib/api-client";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Global Prefetching: Sync cache when user is successfully loaded
  useEffect(() => {
    if (!loading && user) {
      queryClient.prefetchQuery({ queryKey: ["templates"], queryFn: () => getTemplates() });
      queryClient.prefetchQuery({ queryKey: ["public", "options"], queryFn: getPublicOptions });
      queryClient.prefetchQuery({ queryKey: ["public", "settings"], queryFn: getPublicSettings });
      queryClient.prefetchQuery({ queryKey: ["history", 1], queryFn: () => getPromptHistory(1) });
    }
  }, [loading, user, queryClient]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat workspace…
        </div>
      </div>
    );
  }

  return <Outlet />;
}
