"use client";

import { useTranslations } from "next-intl";
import { 
  Users, 
  GraduationCap, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

import { useAuthQueries } from "@/features/auth/hooks/useAuthQueries";
import { useStudentStats, useMyStudentProfile, useStudents } from "@/features/students/hooks/useStudentQueries";
import { useHealth, useMetrics } from "@/features/monitoring/hooks/useMonitoringQueries";
import { Link } from "@/i18n/routing";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const profileT = useTranslations("Profile");
  const { getMeQuery } = useAuthQueries();
  const user = getMeQuery.data;
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";

  const getStatsQuery = useStudentStats({ enabled: isAdmin });
  const { useUsers } = useAuthQueries();
  const usersQuery = useUsers({ enabled: isAdmin });
  
  // To get recent students, we use useStudents with a limit
  const recentStudentsQuery = useStudents({ limit: 4 }, { enabled: isAdmin });
  
  const studentQuery = useMyStudentProfile({ enabled: isStudent });
  const healthQuery = useHealth();
  const metricsQuery = useMetrics();
  
  // Real stats data
  const statsData = getStatsQuery.data || {};
  const totalUsersCount = usersQuery.data?.length || 0;
  const recentStudents = recentStudentsQuery.data || [];
  
  const healthData = healthQuery.data || {};
  const metricsData = metricsQuery.data || {};
  const studentData = studentQuery.data;
  const hasNoProfile = isStudent && !studentQuery.isLoading && !studentData;

  const adminStats = [
    { label: t("total_users"), value: usersQuery.isLoading ? "..." : totalUsersCount, icon: Users, color: "bg-blue-500" },
    { label: t("active_students"), value: getStatsQuery.isLoading ? "..." : (statsData.total_students || 0), icon: GraduationCap, color: "bg-primary" },
    { label: t("system_health"), value: healthData.status === "healthy" ? t("healthy") : "...", icon: Activity, color: "bg-green-500" },
  ];

  const studentStats = [
    { 
      label: t("enrollment_status"), 
      value: healthData.status === "healthy" ? t("active") : t("inactive"), 
      icon: Activity, 
      color: healthData.status === "healthy" ? "bg-green-500" : "bg-red-500" 
    },
    { 
      label: t("system_uptime"), 
      value: healthData.uptime_seconds ? `${Math.floor(healthData.uptime_seconds / 3600)}h` : "...", 
      icon: ShieldCheck, 
      color: "bg-primary" 
    },
    { 
      label: t("global_activity"), 
      value: metricsData.total_requests || "...", 
      icon: GraduationCap, 
      color: "bg-blue-500" 
    },
  ];

  const stats = isStudent ? studentStats : adminStats;

  const activities = isStudent ? [
    { 
      title: t("system_check_db") + ": " + (healthData.services?.database?.status === "online" ? t("online") : t("offline")), 
      time: t("live"), 
      type: "system" 
    },
    { 
      title: t("system_check_cache") + ": " + (healthData.services?.redis?.status === "online" ? t("online") : t("offline")), 
      time: t("live"), 
      type: "system" 
    },
    { 
      title: t("platform_latency") + ": " + (healthData.services?.database?.latency_ms || "0") + "ms", 
      time: t("live"), 
      type: "system" 
    },
  ] : recentStudents.map(student => ({
    title: `${t("activity_new_student")}: ${student.name}`,
    time: t("live"),
    type: "admin"
  }));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">
          {t("welcome_back")}, {user?.full_name || user?.email || "User"}!
        </h1>
        <p className="text-muted-foreground">
          {isStudent 
            ? t("student_welcome_subtitle")
            : t("admin_welcome_subtitle")}
        </p>

        {hasNoProfile && (
          <div className="mt-4 p-6 rounded-[2rem] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-black text-lg">{profileT("not_linked")}</span>
                <span className="text-sm text-muted-foreground">{profileT("complete_profile_desc")}</span>
              </div>
            </div>
            <Link 
              href="/dashboard/profile" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              {profileT("link_now")}
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
              <div className={stat.color + " w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg opacity-80 group-hover:opacity-100 transition-opacity"}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-green-500 text-[10px] font-black bg-green-500/10 px-2 py-1 rounded-full uppercase">
                <TrendingUp className="w-3 h-3" />
                {t("live")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <span className="text-3xl font-black tabular-nums">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 p-8 rounded-[2.5rem] bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{isStudent ? t("platform_health") : t("recent_activity")}</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-bold">{activity.title}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{activity.time}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">{t("status")}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <Activity className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-sm font-bold">{t("no_activity")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-primary text-white overflow-hidden relative shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black leading-tight">
                {isStudent ? t("system_resilience") : t("secure_access")}
              </h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                {isStudent 
                  ? t("system_resilience_desc", { percent: healthData.system?.disk?.percent_used || "0" })
                  : t("secure_access_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
