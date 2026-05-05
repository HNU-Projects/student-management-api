"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/routing";
import { 
  Palette, 
  Languages, 
  PanelLeft, 
  Mail, 
  Lock, 
  LogOut, 
  Check, 
  Loader2,
  Save,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Layout
} from "lucide-react";
import { useUISettings } from "@/context/UISettingsContext";
import { useAuthMutations } from "@/features/auth/hooks/useAuthMutations";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const { theme, setTheme } = useTheme();
  const { isSidebarCompact, setSidebarCompact } = useUISettings();
  const { updateEmailMutation, updatePasswordMutation, logout } = useAuthMutations();
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;
  
  const router = useRouter();
  const pathname = usePathname();

  // Local state for forms
  const [email, setEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailMutation.mutate({ new_email: email }, {
      onSuccess: () => toast.success(t("save_success")),
      onError: (err: any) => toast.error(err?.response?.data?.detail || t("update_failed"))
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    updatePasswordMutation.mutate({
      current_password: passwords.current,
      new_password: passwords.new
    }, {
      onSuccess: () => {
        toast.success(t("password_success"));
        setPasswords({ current: "", new: "", confirm: "" });
      },
      onError: (err: any) => toast.error(err?.response?.data?.detail || t("update_failed"))
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-1 items-center text-center">
        <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("logout_desc")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <section className="bg-card border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            {t("appearance")}
          </h2>

          <div className="flex flex-col gap-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{t("theme")}</span>
                <span className="text-xs text-muted-foreground">{t("theme_desc")}</span>
              </div>
              <div className="flex bg-muted p-1 rounded-xl">
                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    theme === "light" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                  )}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    theme === "dark" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                  )}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{t("language")}</span>
                <span className="text-xs text-muted-foreground">{t("lang_desc")}</span>
              </div>
              <div className="flex bg-muted p-1 rounded-xl">
                <button 
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    pathname.startsWith("/ar") ? "text-muted-foreground" : "bg-background shadow-sm text-primary"
                  )}
                >
                  EN
                </button>
                <button 
                  onClick={() => handleLanguageChange("ar")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    pathname.startsWith("/ar") ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                  )}
                >
                  AR
                </button>
              </div>
            </div>

            {/* Sidebar Style */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{t("sidebar")}</span>
                <span className="text-xs text-muted-foreground">{t("sidebar_desc")}</span>
              </div>
              <div className="flex bg-muted p-1 rounded-xl">
                <button 
                  onClick={() => setSidebarCompact(false)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    !isSidebarCompact ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                  )}
                >
                  <Layout className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSidebarCompact(true)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isSidebarCompact ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                  )}
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section - Email */}
        <section className="bg-card border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            {t("account")}
          </h2>

          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("new_email")}
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={t("email_placeholder") || "name@example.com"}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={updateEmailMutation.isPending}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/10 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {updateEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("update_email")}
            </button>
          </form>
        </section>

        {/* Security Section - Password */}
        <section className="bg-card border border-border rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-black flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary" />
            {t("password")}
          </h2>

          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("current_password")}
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all pe-10"
                  placeholder={t("password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("new_password")}
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all pe-10"
                  placeholder={t("password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("confirm_password")}
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all pe-10"
                  placeholder={t("password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="md:col-span-3">
              <button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="flex items-center justify-center gap-2 w-full md:w-fit md:px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/10 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updatePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("update_password")}
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-black flex items-center gap-3 text-red-500">
            <LogOut className="w-5 h-5" />
            {t("danger_zone")}
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t("logout_desc")}</p>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/10 hover:bg-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
