import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  GraduationCap,
  UserCircle,
  Home
} from "lucide-react";

export type Role = "admin" | "student" | "public";

export interface RouteConfig {
  path: string;
  roles: Role[];
  isPublic?: boolean;
  label?: string;
  icon?: any;
  showInSidebar?: boolean;
  group?: string;
}

export const routesConfig: Record<string, RouteConfig> = {
  home: {
    path: "/",
    roles: ["public", "admin", "student"],
    isPublic: true,
    label: "nav_back_home",
    icon: Home,
    showInSidebar: true,
    group: "group_menu",
  },
  dashboard: {
    path: "/dashboard",
    roles: ["admin", "student"],
    label: "nav_overview",
    icon: LayoutDashboard,
    showInSidebar: true,
    group: "group_menu",
  },
  students: {
    path: "/dashboard/students",
    roles: ["admin"],
    label: "nav_students",
    icon: GraduationCap,
    showInSidebar: true,
    group: "group_management",
  },
  users: {
    path: "/dashboard/users",
    roles: ["admin"],
    label: "nav_users",
    icon: Users,
    showInSidebar: true,
    group: "group_management",
  },
  profile: {
    path: "/dashboard/profile",
    roles: ["admin", "student"],
    label: "nav_profile",
    icon: UserCircle,
    showInSidebar: true,
    group: "group_account",
  },
  settings: {
    path: "/dashboard/settings",
    roles: ["admin", "student"],
    label: "nav_settings",
    icon: Settings,
    showInSidebar: true,
    group: "group_account",
  },
  login: {
    path: "/login",
    roles: ["public"],
    isPublic: true,
  },
  register: {
    path: "/register",
    roles: ["public"],
    isPublic: true,
  },
  "project-details": {
    path: "/project-details",
    roles: ["public"],
    isPublic: true,
  },
  // Add more routes here, and they will be automatically handled
  // Example:
  // students: {
  //   path: "/students",
  //   roles: ["admin"],
  // },
};

export const getRouteConfig = (pathname: string): RouteConfig | undefined => {
  // Remove locale prefix if present (e.g., /en/dashboard -> /dashboard)
  const normalizedPath = pathname.replace(/^\/(en|ar)/, "") || "/";
  
  return Object.values(routesConfig).find((route) => {
    // Basic match, could be improved with regex for dynamic routes
    return normalizedPath === route.path || normalizedPath.startsWith(route.path + "/");
  });
};
