"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useUISettings } from "@/context/UISettingsContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProfilePage = pathname?.includes("/profile");
  const { isSidebarCompact } = useUISettings();

  if (isProfilePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300 md:ml-[var(--sidebar-width)]"
      )}>
        <Header />
        
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
