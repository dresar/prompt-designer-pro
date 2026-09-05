import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin/templates")({
  component: () => (
    <AdminShell 
      title="Prompt Generator Templates"
    >
      <Outlet />
    </AdminShell>
  ),
});
