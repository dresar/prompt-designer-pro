import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin/categories")({
  component: () => (
    <AdminShell 
      title="Manajemen Kategori" 
    >
      <Outlet />
    </AdminShell>
  ),
});
