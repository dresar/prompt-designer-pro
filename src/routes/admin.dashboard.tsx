import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/api-client";
import { Users, LibraryBig, KeyRound, Wand2, Activity, Server } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getAdminStats,
    refetchInterval: 30000, // Refresh every 30s
  });

  const cards = [
    { title: "Total Users", value: stats?.overview?.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Users (7d)", value: stats?.overview?.activeUsers7d, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Templates", value: stats?.overview?.totalTemplates, icon: LibraryBig, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Prompts Generated", value: stats?.overview?.totalPrompts, icon: Wand2, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Active API Keys", value: stats?.overview?.totalApiKeys, icon: KeyRound, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "API Errors", value: stats?.overview?.erroredApiKeys, icon: Activity, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <AdminShell 
      title="Admin Dashboard" 
      subtitle="Overview of system metrics and statistics"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          : cards.map((card, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">{card.value ?? "-"}</h3>
                </div>
              </div>
            ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">System Status</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">App Version</span>
                <span className="font-medium">{stats?.system?.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-medium">{Math.floor((stats?.system?.uptime?.process || 0) / 60)} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Database</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="font-medium text-green-600">{stats?.system?.database?.status || "Connected"}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="font-medium capitalize">{stats?.system?.environment || "Development"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
