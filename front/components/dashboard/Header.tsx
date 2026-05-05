"use client";

import { useTranslations } from "next-intl";
import { Search, Bell, User } from "lucide-react";
import { ThemeToggle } from "../layout/ThemeToggle";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";

import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";

export function Header() {
  const t = useTranslations("Dashboard");
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border relative px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t("search_placeholder")}
            className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggle />
        

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold">{user?.full_name || "..."}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {user?.role ? t(`role_${user.role}`) : "..."}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
