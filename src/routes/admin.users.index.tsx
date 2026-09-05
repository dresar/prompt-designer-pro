import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateAdminUser, deleteAdminUser, createAdminUser, resetAdminUserPassword } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Shield, User as UserIcon, Plus, MoreHorizontal, Pencil, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/users/")({
  component: UsersList,
});

function UsersList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  
  // Selected user for Edit/Reset
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user", plan: "Free", isActive: true });
  const [resetPassword, setResetPassword] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => getAdminUsers(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User berhasil dibuat");
      setIsCreateOpen(false);
      setFormData({ name: "", email: "", password: "", role: "user", plan: "Free", isActive: true });
    },
    onError: (err: any) => toast.error(err.message || "Gagal membuat user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User berhasil diperbarui");
      setIsEditOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Gagal memperbarui user"),
  });

  const resetPwdMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) => resetAdminUserPassword(id, newPassword),
    onSuccess: () => {
      toast.success("Password berhasil direset");
      setIsResetOpen(false);
      setResetPassword("");
    },
    onError: (err: any) => toast.error(err.message || "Gagal mereset password"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User dihapus");
    },
    onError: (err: any) => toast.error(err.message || "Gagal menghapus user"),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateMutation.mutate({
      id: selectedUser.id,
      data: { name: formData.name, role: formData.role, plan: formData.plan, isActive: formData.isActive }
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPassword) return;
    resetPwdMutation.mutate({ id: selectedUser.id, newPassword: resetPassword });
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...formData, name: user.name, role: user.role, plan: user.plan, isActive: user.isActive });
    setIsEditOpen(true);
  };

  const openReset = (user: any) => {
    setSelectedUser(user);
    setResetPassword("");
    setIsResetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah User
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data users...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada user.
                  </td>
                </tr>
              ) : (
                data?.data.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
                          <Shield className="h-3 w-3" /> Admin
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.plan === "Pro" ? "default" : "secondary"} className="capitalize">
                        {user.plan || "Free"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {format(new Date(user.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openReset(user)}>
                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Hapus user ${user.name}?`)) deleteMutation.mutate(user.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta?.totalPages > 1 && (
          <div className="border-t p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">{data.meta.totalItems}</span> user
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={formData.plan} onValueChange={v => setFormData({ ...formData, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={formData.plan} onValueChange={v => setFormData({ ...formData, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status Akun</Label>
              <Select value={formData.isActive ? "true" : "false"} onValueChange={v => setFormData({ ...formData, isActive: v === "true" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif (Banned/Suspended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RESET PASSWORD MODAL */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Password Baru untuk {selectedUser?.name}</Label>
              <Input type="text" required minLength={6} value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Masukkan password baru..." />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>Batal</Button>
              <Button type="submit" disabled={resetPwdMutation.isPending}>
                {resetPwdMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
