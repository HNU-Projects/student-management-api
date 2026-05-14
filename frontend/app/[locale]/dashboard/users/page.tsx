"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { 
  Users as UsersIcon, 
  Search, 
  Shield, 
  MoreVertical,
  Edit2, 
  Trash2, 
  UserCircle,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  User as UserIcon,
  X,
  Lock,
  Plus,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { useAuthMutations } from "@/features/auth/hooks/useAuthMutations";
import { User } from "@/features/auth/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UsersManagementPage() {
  const t = useTranslations("Users");
  const commonT = useTranslations("Dashboard");
  const profileT = useTranslations("Profile");

  const authT = useTranslations("Auth");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const { useUsers } = useAuthQueries();
  const { data: users, isLoading, refetch } = useUsers({ enabled: true });
  const { createUserMutation, deleteUserMutation, adminUpdateUserMutation } = useAuthMutations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "student" as "admin" | "student"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, email: string } | null>(null);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) || 
                         user.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't show password
      full_name: user.full_name || "",
      role: user.role as "admin" | "student"
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      adminUpdateUserMutation.mutate(
        { userId: editingUser.id, data: formData },
        {
          onSuccess: () => {
            toast.success(t("update_success"));
            setIsFormOpen(false);
            setEditingUser(null);
            setFormData({ email: "", password: "", full_name: "", role: "student" });
            refetch();
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Update failed");
          }
        }
      );
    } else {
      createUserMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(t("create_success"));
          setIsFormOpen(false);
          setFormData({ email: "", password: "", full_name: "", role: "student" });
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || t("create_failed"));
        }
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    
    deleteUserMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast.success(t("delete_success"));
        setDeleteConfirm(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || t("delete_failed"));
      }
    });
  };



  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{commonT("group_management")}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="rounded-xl font-bold py-6 px-6 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5 me-2" />
          {t("add_new")}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 ps-11 pe-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="relative group">
          <Shield className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 ps-11 pe-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
          >
            <option value="">{t("role_filter")}</option>
            <option value="admin">{commonT("role_admin")}</option>
            <option value="student">{commonT("role_student")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("full_name")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("email_address")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("user_role")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !filteredUsers || filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-bold">
                    {t("no_results")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-black tabular-nums">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.role === "admin" ? <ShieldCheck className="w-4 h-4 text-primary" /> : <UserCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <span className="text-sm font-bold">{user.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary/60" />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="rounded-lg capitalize font-bold text-[10px]">
                        {commonT(`role_${user.role}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                          title={t("edit")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => setDeleteConfirm({ id: user.id, email: user.email })}
                          disabled={deleteUserMutation.isPending}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all disabled:opacity-30"
                          title={t("delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-xl font-black flex items-center gap-3">
                {editingUser ? <Edit2 className="w-6 h-6 text-primary" /> : <UsersIcon className="w-6 h-6 text-primary" />}
                {editingUser ? t("edit") : t("add_new")}
              </h2>
              <button onClick={() => { setIsFormOpen(false); setEditingUser(null); }} className="p-2 rounded-xl hover:bg-muted transition-all">
                <X className="w-5 h-5" />
              </button>

            </div>
            
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-primary" />
                  {profileT("full_name")}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={authT("name_placeholder")}
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {profileT("email_address")}
                </label>
                <input 
                  type="email"
                  required
                  placeholder={authT("email_placeholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  {authT("password_label")}
                </label>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    placeholder={editingUser ? "Leave blank to keep current" : authT("password_placeholder")}

                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-muted border border-border rounded-xl py-3 ps-4 pe-11 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  {profileT("user_role")}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'student'})}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.role === 'student' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {commonT("role_student")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.role === 'admin' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {commonT("role_admin")}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl font-bold py-6"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("confirm")}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl font-bold py-6 px-8"
                >
                  {profileT("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black">{t("delete_confirm_title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("delete_confirm_desc", { email: deleteConfirm.email })}
              </p>
              
              <div className="flex items-center gap-3 w-full mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl font-bold py-6"
                >
                  {t("cancel")}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 rounded-xl font-bold py-6 shadow-lg shadow-red-500/20"
                >
                  {deleteUserMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
