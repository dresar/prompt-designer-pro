import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin/api-keys")({
  component: () => (
    <AdminShell 
      title="Manajemen API Keys" 
    >
      <Outlet />
    </AdminShell>
  ),
});
