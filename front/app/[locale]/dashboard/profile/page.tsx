"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  Calendar,
  BookOpen,
  ArrowLeft,
  Phone,
  Hash,
  Building,
  Trophy,
  Loader2,
  Save,
  Edit3,
  X,
  CheckCircle,
} from "lucide-react";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { useMyStudentProfile } from "@/features/students/hooks/useStudentQueries";
import { useStudentMutations } from "@/features/students/hooks/useStudentMutations";
import { StudentCreate, StudentUpdate, Gender, StudentStatus } from "@/features/students/types";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;

  // Fetch student record via /students/me
  const studentQuery = useMyStudentProfile({ 
    enabled: user?.role === "student" 
  });
  const student = studentQuery.data;

  const { createStudentMutation, updateStudentMutation } = useStudentMutations();

  const [isEditing, setIsEditing] = useState(false);

  if (getMeQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isStudent = user.role === "student";
  const hasStudentRecord = !!student;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-primary font-bold text-sm hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back_to_dashboard")}
        </Link>

        {/* Profile header */}
        <div className="flex flex-col items-center text-center gap-5">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-background">
            <User className="w-14 h-14 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight">
              {user.full_name || user.email}
            </h1>
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              {t(`role_${user.role}`)}
            </span>
          </div>
        </div>

        {/* Account Info — from /users/me */}
        <section className="bg-card border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            {t("personal_info")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField
              icon={<User className="w-4 h-4" />}
              label={t("full_name")}
              value={user.full_name || "—"}
            />
            <InfoField
              icon={<Mail className="w-4 h-4" />}
              label={t("email_address")}
              value={user.email}
            />
            <InfoField
              icon={<Shield className="w-4 h-4" />}
              label={t("user_role")}
              value={t(`role_${user.role}`)}
            />
            <InfoField
              icon={<Hash className="w-4 h-4" />}
              label="User ID"
              value={String(user.id)}
            />
          </div>
        </section>

        {/* Academic Record — for students only */}
        {isStudent && (
          <section className="bg-card border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                {t("academic_record")}
              </h2>
              {studentQuery.isLoading && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
              {hasStudentRecord && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t("edit_profile")}
                </button>
              )}
            </div>

            {studentQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : hasStudentRecord && !isEditing ? (
              /* Display student data */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoField
                  icon={<Hash className="w-4 h-4" />}
                  label={t("university_id")}
                  value={student.university_id}
                />
                <InfoField
                  icon={<Building className="w-4 h-4" />}
                  label={t("department")}
                  value={student.department}
                />
                <InfoField
                  icon={<Trophy className="w-4 h-4" />}
                  label={t("gpa")}
                  value={student.gpa != null ? String(student.gpa) : "—"}
                />
                <InfoField
                  icon={<Calendar className="w-4 h-4" />}
                  label={t("enrollment_date")}
                  value={student.enrollment_date || "—"}
                />
                {student.phone_number && (
                  <InfoField
                    icon={<Phone className="w-4 h-4" />}
                    label={t("phone")}
                    value={student.phone_number}
                  />
                )}
                {student.gender && (
                  <InfoField
                    icon={<User className="w-4 h-4" />}
                    label={t("gender")}
                    value={t(`gender_${student.gender}`)}
                  />
                )}
                {student.status && (
                  <InfoField
                    icon={<Shield className="w-4 h-4" />}
                    label={t("student_status")}
                    value={t(`status_${student.status}`)}
                  />
                )}
              </div>
            ) : hasStudentRecord && isEditing ? (
              /* Edit student data */
              <StudentEditForm
                student={student}
                onCancel={() => setIsEditing(false)}
                onSave={(data) => {
                  updateStudentMutation.mutate(
                    { id: student.id, data },
                    {
                      onSuccess: () => {
                        setIsEditing(false);
                        toast.success(t("save_changes"));
                      },
                      onError: (error) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        toast.error((error as any)?.response?.data?.detail || "Update failed");
                      },
                    }
                  );
                }}
                isLoading={updateStudentMutation.isPending}
                t={t}
              />
            ) : (
              /* No student record — show StudentCreate form */
              <StudentCreateForm
                userId={user.id}
                userName={user.full_name || user.email}
                onSuccess={() => {
                  studentQuery.refetch();
                  toast.success(t("profile_linked_success"));
                }}
                t={t}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/* ─── Info Display Component ─── */
function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          {label}
        </span>
        <span className="font-bold text-sm truncate">{value}</span>
      </div>
    </div>
  );
}

/* ─── Student Create Form (for unlinked students) ─── */
function StudentCreateForm({
  userId,
  userName,
  onSuccess,
  t,
}: {
  userId: number;
  userName: string;
  onSuccess: () => void;
  t: (key: string) => string;
}) {
  const { createStudentMutation } = useStudentMutations();
  const [formData, setFormData] = useState({
    university_id: "",
    name: userName,
    department: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    gpa: 0,
    birth_date: "",
    gender: "" as Gender | "",
    phone_number: "",
    status: "active" as StudentStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: StudentCreate = {
      university_id: formData.university_id,
      name: formData.name,
      department: formData.department,
      enrollment_date: formData.enrollment_date,
      gpa: formData.gpa,
      status: formData.status,
      user_id: userId,
      ...(formData.birth_date ? { birth_date: formData.birth_date } : {}),
      ...(formData.gender ? { gender: formData.gender as Gender } : {}),
      ...(formData.phone_number ? { phone_number: formData.phone_number } : {}),
    };

    createStudentMutation.mutate(payload, {
      onSuccess: () => onSuccess(),
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((error as any)?.response?.data?.detail || "Failed to create profile");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Not linked notice */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm">{t("not_linked")}</span>
          <span className="text-xs text-muted-foreground">{t("complete_profile_desc")}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* University ID — Required */}
          <FormField
            label={t("university_id")}
            required
            icon={<Hash className="w-4 h-4" />}
          >
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={formData.university_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, university_id: e.target.value }))
              }
              placeholder={t("university_id_placeholder")}
              className="form-input"
            />
          </FormField>

          {/* Name — Required */}
          <FormField
            label={t("full_name")}
            required
            icon={<User className="w-4 h-4" />}
          >
            <input
              type="text"
              required
              minLength={1}
              maxLength={150}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("name_placeholder")}
              className="form-input"
            />
          </FormField>

          {/* Department — Required */}
          <FormField
            label={t("department")}
            required
            icon={<Building className="w-4 h-4" />}
          >
            <input
              type="text"
              required
              minLength={1}
              maxLength={100}
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              placeholder={t("department_placeholder")}
              className="form-input"
            />
          </FormField>

          {/* Enrollment Date — Required */}
          <FormField
            label={t("enrollment_date")}
            required
            icon={<Calendar className="w-4 h-4" />}
          >
            <input
              type="date"
              required
              value={formData.enrollment_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, enrollment_date: e.target.value }))
              }
              className="form-input"
            />
          </FormField>

          {/* GPA */}
          <FormField label={t("gpa")} icon={<Trophy className="w-4 h-4" />}>
            <input
              type="number"
              step="0.01"
              min={0}
              max={4}
              value={formData.gpa}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gpa: parseFloat(e.target.value) || 0 }))
              }
              className="form-input"
            />
          </FormField>

          {/* Birth Date */}
          <FormField label={t("birth_date")} icon={<Calendar className="w-4 h-4" />}>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, birth_date: e.target.value }))
              }
              className="form-input"
            />
          </FormField>

          {/* Gender */}
          <FormField label={t("gender")} icon={<User className="w-4 h-4" />}>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gender: e.target.value as Gender | "" }))
              }
              className="form-input"
            >
              <option value="">—</option>
              <option value="male">{t("gender_male")}</option>
              <option value="female">{t("gender_female")}</option>
            </select>
          </FormField>

          {/* Phone Number */}
          <FormField label={t("phone")} icon={<Phone className="w-4 h-4" />}>
            <input
              type="tel"
              maxLength={20}
              value={formData.phone_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
              }
              placeholder={t("phone_placeholder")}
              className="form-input"
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={createStudentMutation.isPending}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/10 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createStudentMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {t("link_now")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ─── Student Edit Form (for updating existing record) ─── */
function StudentEditForm({
  student,
  onCancel,
  onSave,
  isLoading,
  t,
}: {
  student: {
    university_id: string;
    name: string;
    department: string;
    enrollment_date: string;
    gpa: number;
    birth_date?: string | null;
    gender?: Gender | null;
    phone_number?: string | null;
    status: StudentStatus;
  };
  onCancel: () => void;
  onSave: (data: StudentUpdate) => void;
  isLoading: boolean;
  t: (key: string) => string;
}) {
  const [formData, setFormData] = useState({
    name: student.name,
    phone_number: student.phone_number || "",
    birth_date: student.birth_date || "",
    gender: (student.gender || "") as Gender | "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: StudentUpdate = {
      name: formData.name || null,
      phone_number: formData.phone_number || null,
      birth_date: formData.birth_date || null,
      gender: (formData.gender as Gender) || null,
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t("full_name")} icon={<User className="w-4 h-4" />}>
          <input
            type="text"
            minLength={1}
            maxLength={150}
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder={t("name_placeholder")}
            className="form-input"
          />
        </FormField>

        <FormField label={t("phone")} icon={<Phone className="w-4 h-4" />}>
          <input
            type="tel"
            maxLength={20}
            value={formData.phone_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
            placeholder={t("phone_placeholder")}
            className="form-input"
          />
        </FormField>

        <FormField label={t("birth_date")} icon={<Calendar className="w-4 h-4" />}>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, birth_date: e.target.value }))
            }
            className="form-input"
          />
        </FormField>

        <FormField label={t("gender")} icon={<User className="w-4 h-4" />}>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value as Gender | "" }))
            }
            className="form-input"
          >
            <option value="">—</option>
            <option value="male">{t("gender_male")}</option>
            <option value="female">{t("gender_female")}</option>
          </select>
        </FormField>
      </div>

      {/* Read-only fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
        <InfoField
          icon={<Hash className="w-4 h-4" />}
          label={t("university_id")}
          value={student.university_id}
        />
        <InfoField
          icon={<Building className="w-4 h-4" />}
          label={t("department")}
          value={student.department}
        />
        <InfoField
          icon={<Trophy className="w-4 h-4" />}
          label={t("gpa")}
          value={String(student.gpa)}
        />
        <InfoField
          icon={<Shield className="w-4 h-4" />}
          label={t("student_status")}
          value={t(`status_${student.status}`)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/10 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t("save_changes")}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-all"
        >
          <X className="w-4 h-4" />
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

/* ─── Form Field Wrapper ─── */
function FormField({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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
