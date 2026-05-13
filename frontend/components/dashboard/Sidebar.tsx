"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Settings, 
  LogOut, 
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthMutations } from "@/features/auth/hooks/useAuthMutations";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { routesConfig } from "@/lib/routes-config";
import { useUISettings } from "@/context/UISettingsContext";

export function Sidebar() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const { logout } = useAuthMutations();
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;
  const { isSidebarCompact } = useUISettings();

  const navItems = Object.values(routesConfig).filter(
    (route) => 
      route.showInSidebar && 
      user && 
      route.roles.includes(user.role)
  );

  const groupedNavItems = navItems.reduce((acc, item) => {
    const groupName = item.group || "default";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const groupOrder = ["group_menu", "group_management", "group_account"];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border hidden md:flex flex-col z-50 transition-all duration-300 w-[var(--sidebar-width)]"
    )}>
      <div className={cn("p-6 flex items-center gap-3", isSidebarCompact && "justify-center px-2")}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        {!isSidebarCompact && <span className="font-black text-xl tracking-tighter">StudentFlow</span>}
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto">
        {groupOrder.map((groupKey) => {
          const items = groupedNavItems[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <div key={groupKey} className="flex flex-col gap-2">
              {!isSidebarCompact && (
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                  {t(groupKey)}
                </h3>
              )}
              {isSidebarCompact && <div className="h-px bg-border mx-4 my-2" />}
              
              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl transition-all group/item",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-primary")} />
                        {!isSidebarCompact && <span className="font-bold text-sm">{t(item.label || "")}</span>}
                      </div>
                      {isActive && !isSidebarCompact && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border mt-auto">
        <button 
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all w-full font-bold text-sm",
            isSidebarCompact && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isSidebarCompact && t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
