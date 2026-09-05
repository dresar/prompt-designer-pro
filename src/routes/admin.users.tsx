import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <AdminShell 
      title="Manajemen Pengguna" 
    >
      <Outlet />
    </AdminShell>
  ),
});
