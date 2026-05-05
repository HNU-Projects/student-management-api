"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Mail, Lock, User, ShieldCheck, UserCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuthMutations } from "@/features/auth/hooks/useAuthMutations";

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { registerMutation } = useAuthMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate({
      email,
      password,
      full_name: fullName,
      role,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-[450px] relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('back_to_home')}
        </Link>

        <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 md:p-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black tracking-tight">{t('register_title')}</h1>
              <p className="text-muted-foreground text-sm">{t('register_subtitle')}</p>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {t('name_label')}
              </label>
              <div className="relative group">
                <div className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('name_placeholder')}
                  required
                  className="w-full text-sm bg-muted/50 border border-border rounded-xl py-3.5 ps-11 pe-4 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {t('email_label')}
              </label>
              <div className="relative group">
                <div className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  required
                  className="w-full text-sm bg-muted/50 border border-border rounded-xl py-3.5 ps-11 pe-4 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {t('password_label')}
              </label>
              <div className="relative group">
                <div className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  required
                  className="w-full text-sm bg-muted/50 border border-border rounded-xl py-3.5 ps-11 pe-11 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-6 rounded-xl text-lg font-bold shadow-xl shadow-primary/10 mt-2"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('submit_register')
              )}
            </Button>

            {registerMutation.isError && (
              <p className="text-xs text-red-500 text-center font-medium mt-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(registerMutation.error as any)?.response?.data?.detail || "Registration failed"}
              </p>
            )}
          </form>

          <div className="mt-8 text-center flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{t('have_account')}</p>
            <Link href="/login" className="text-sm font-bold text-primary hover:underline">
              {t('go_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
