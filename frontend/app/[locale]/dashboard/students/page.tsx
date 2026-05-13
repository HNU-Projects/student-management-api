"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  GraduationCap, 
  Building, 
  Trophy, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  User as UserIcon,
  Calendar,
  Hash,
  Shield,
  AlertCircle
} from "lucide-react";
import { useStudents } from "@/features/students/hooks/useStudentQueries";
import { useStudentMutations } from "@/features/students/hooks/useStudentMutations";
import { StudentResponse, StudentUpdate, StudentCreate, Gender, StudentStatus } from "@/features/students/types";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  const t = useTranslations("Students");
  const commonT = useTranslations("Dashboard");
  const profileT = useTranslations("Profile");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: students, isLoading, refetch } = useStudents({
    search: search || undefined,
    department: department || undefined,
    skip: page * limit,
    limit: limit
  });

  const { deleteStudentMutation } = useStudentMutations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, name: string } | null>(null);

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    
    deleteStudentMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast.success(t("delete_success"));
        setDeleteConfirm(null);
        refetch();
      }
    });
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentResponse) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{commonT("group_management")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-xl font-bold py-6 px-6 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5 me-2" />
          {t("add_new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t("search")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-card border border-border rounded-xl py-3 ps-11 pe-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="relative group">
          <Building className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t("filter")}
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
            className="w-full bg-card border border-border rounded-xl py-3 ps-11 pe-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("university_id")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("full_name")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("department")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("gpa")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{profileT("student_status")}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !students || students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-bold">
                    {t("no_results")}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-black tabular-nums">{student.university_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">UID: {student.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-primary/60" />
                        <span className="text-sm font-medium">{student.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm font-black tabular-nums">{student.gpa.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.status === "active" ? "default" : "secondary" as any} className="rounded-lg capitalize font-bold text-[10px]">
                        {profileT(`status_${student.status}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(student)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                          title={t("edit")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ id: student.id, name: student.name })}
                          disabled={deleteStudentMutation.isPending}
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-xs text-muted-foreground font-bold">
            Page {page + 1}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={!students || students.length < limit}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Overlay (Simple Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-xl font-black flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-primary" />
                {editingStudent ? t("edit") : t("add_new")}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-muted transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[80vh]">
              <StudentManagementForm 
                student={editingStudent} 
                onSuccess={() => { closeForm(); refetch(); }} 
                onCancel={closeForm}
                t={t}
                profileT={profileT}
              />
            </div>
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
                {t("delete_confirm_desc", { name: deleteConfirm.name })}
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
                  disabled={deleteStudentMutation.isPending}
                  className="flex-1 rounded-xl font-bold py-6 shadow-lg shadow-red-500/20"
                >
                  {deleteStudentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentManagementForm({ 
  student, 
  onSuccess, 
  onCancel,
  t,
  profileT
}: { 
  student: StudentResponse | null, 
  onSuccess: () => void, 
  onCancel: () => void,
  t: (k: string) => string,
  profileT: (k: string) => string
}) {
  const { createStudentMutation, updateStudentMutation } = useStudentMutations();
  const { useUsers } = useAuthQueries();
  const { data: users } = useUsers({ enabled: !student });
  
  const [formData, setFormData] = useState({
    university_id: student?.university_id || "",
    name: student?.name || "",
    department: student?.department || "",
    enrollment_date: student?.enrollment_date || new Date().toISOString().split('T')[0],
    gpa: student?.gpa || 0,
    status: student?.status || "active" as StudentStatus,
    user_id: student?.user_id || 0,
    gender: (student?.gender || "") as Gender | "",
    phone_number: student?.phone_number || "",
    birth_date: student?.birth_date || ""
  });

  const studentUsers = users?.filter(u => u.role === "student") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (student) {
      // Update
      const payload: StudentUpdate = {
        university_id: formData.university_id,
        name: formData.name,
        department: formData.department,
        enrollment_date: formData.enrollment_date,
        gpa: formData.gpa,
        status: formData.status,
        gender: formData.gender || null,
        phone_number: formData.phone_number || null,
        birth_date: formData.birth_date || null
      };
      
      updateStudentMutation.mutate({ id: student.id, data: payload }, {
        onSuccess: () => {
          toast.success(t("update_success"));
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || "Update failed");
        }
      });
    } else {
      // Create
      if (!formData.user_id) {
        toast.error("Please select a user account first");
        return;
      }

      const payload: StudentCreate = {
        university_id: formData.university_id,
        name: formData.name,
        department: formData.department,
        enrollment_date: formData.enrollment_date,
        gpa: formData.gpa,
        status: formData.status,
        user_id: formData.user_id,
        gender: formData.gender || null,
        phone_number: formData.phone_number || null,
        birth_date: formData.birth_date || null
      };
      
      createStudentMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("create_success"));
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.detail || "Creation failed");
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={profileT("university_id")} required icon={<Hash className="w-4 h-4" />}>
          <input 
            type="text" 
            required 
            placeholder={t("university_id_placeholder")}
            value={formData.university_id}
            onChange={(e) => setFormData({...formData, university_id: e.target.value})}
            className="form-input"
          />
        </FormField>
        
        <FormField label={profileT("full_name")} required icon={<UserIcon className="w-4 h-4" />}>
          <input 
            type="text" 
            required 
            placeholder={t("name_placeholder")}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="form-input"
          />
        </FormField>
 
        <FormField label={profileT("department")} required icon={<Building className="w-4 h-4" />}>
          <input 
            type="text" 
            required 
            placeholder={t("department_placeholder")}
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            className="form-input"
          />
        </FormField>

        <FormField label={profileT("enrollment_date")} required icon={<Calendar className="w-4 h-4" />}>
          <input 
            type="date" 
            required 
            value={formData.enrollment_date}
            onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
            className="form-input"
          />
        </FormField>

        <FormField label={profileT("gpa")} icon={<Trophy className="w-4 h-4" />}>
          <input 
            type="number" 
            step="0.01" 
            min={0} 
            max={4}
            value={formData.gpa}
            onChange={(e) => setFormData({...formData, gpa: parseFloat(e.target.value) || 0})}
            className="form-input"
          />
        </FormField>

        <FormField label={profileT("student_status")} icon={<Shield className="w-4 h-4" />}>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as StudentStatus})}
            className="form-input"
          >
            <option value="active">{profileT("status_active")}</option>
            <option value="graduated">{profileT("status_graduated")}</option>
            <option value="suspended">{profileT("status_suspended")}</option>
          </select>
        </FormField>

        {!student && (
          <FormField label={profileT("email_address")} required icon={<Plus className="w-4 h-4" />}>
            <select 
              required 
              value={formData.user_id || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({...formData, user_id: val});
                // Auto-fill name if empty
                const selectedUser = users?.find(u => u.id === val);
                if (selectedUser && !formData.name) {
                  setFormData(prev => ({...prev, user_id: val, name: selectedUser.full_name || ""}));
                }
              }}
              className="form-input appearance-none"
            >
              <option value="">{t("select_user") || "Select User Account"}</option>
              {studentUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.full_name || "No Name"})
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label={profileT("gender")} icon={<UserIcon className="w-4 h-4" />}>
          <select 
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value as Gender | ""})}
            className="form-input"
          >
            <option value="">—</option>
            <option value="male">{profileT("gender_male")}</option>
            <option value="female">{profileT("gender_female")}</option>
          </select>
        </FormField>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 rounded-xl font-bold py-6"
          disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
        >
          {createStudentMutation.isPending || updateStudentMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t(student ? "confirm" : "add_new")
          )}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          className="rounded-xl font-bold py-6 px-8"
        >
          {profileT("cancel")}
        </Button>
      </div>
    </form>
  );
}

function FormField({ label, required, icon, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
        <span className="text-primary">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
