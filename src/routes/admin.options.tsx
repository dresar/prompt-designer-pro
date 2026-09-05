import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin/options")({
  component: () => (
    <AdminShell 
      title="Setting Prompt" 
    >
      <Outlet />
    </AdminShell>
  ),
});
