"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, ReactNode } from "react";
import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { getRouteConfig } from "@/lib/routes-config";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface RoleProtectedRouteProps {
  children: ReactNode;
}

export const RoleProtectedRoute = ({ children }: RoleProtectedRouteProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Auth');
  const { getMeQuery } = useAuthQueries();
  const { data: user, isLoading, isError } = getMeQuery;

  useEffect(() => {
    if (isLoading) return;

    const routeConfig = getRouteConfig(pathname);

    // If no config found, assume it's public or handled elsewhere
    if (!routeConfig) return;

    // If the route is public, allow access
    if (routeConfig.isPublic) {
      // If user is already logged in and trying to access login/register, redirect to dashboard
      const isAuthPage = pathname.includes("/login") || pathname.includes("/register");
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
      
      if (user && !isError && hasToken && isAuthPage) {
        router.push("/dashboard");
      }
      return;
    }

    // Protected route logic
    if (!user || isError) {
      toast.error(t('login_required'));
      router.push("/login");
      return;
    }

    // Role-based access control
    if (routeConfig.roles && !routeConfig.roles.includes(user.role)) {
      toast.error(t('permission_denied'));
      router.push("/dashboard"); // Or a dedicated unauthorized page
    }
  }, [user, isLoading, isError, pathname, router, t]);

  // Show nothing or a loader while checking permissions on protected routes
  const routeConfig = getRouteConfig(pathname);
  if (routeConfig && !routeConfig.isPublic && (isLoading || !user)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
