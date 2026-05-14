"use client";

import { useTranslations } from "next-intl";
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Search,
  ChevronRight,
  Terminal,
  ShieldCheck,
  Zap,
  UserIcon
} from "lucide-react";
import { useHealth, useMetrics } from "@/features/monitoring/hooks/useMonitoringQueries";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function MonitoringPage() {
  const t = useTranslations("Monitoring");
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealth();
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useMetrics();
  
  const [countdown, setCountdown] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    refetchHealth();
    refetchMetrics();
    setCountdown(10);
  };

  const isHealthy = health?.status === "healthy";

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            {t("health_status")}
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            {t("title")}
            {isHealthy ? (
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse mt-2" />
            ) : (
              <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse mt-2" />
            )}
          </h1>
          <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
        </div>

        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 group"
        >
          <RefreshCw className={cn("w-4 h-4 transition-transform group-active:rotate-180", (healthLoading || metricsLoading) && "animate-spin")} />
          {t("refreshing", { seconds: countdown })}
        </button>
      </header>

      {/* Top Cards: Health & Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health Status */}
        <StatusCard 
          title={t("health_status")}
          value={health?.status?.toUpperCase() || "..."}
          icon={isHealthy ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          variant={isHealthy ? "success" : "warning"}
          loading={healthLoading}
        />
        
        {/* Uptime */}
        <StatusCard 
          title={t("uptime")}
          value={formatUptime(health?.uptime_seconds)}
          icon={<Clock className="w-6 h-6" />}
          variant="primary"
          loading={healthLoading}
        />

        {/* Platform Info */}
        <StatusCard 
          title={t("system_info")}
          value={`${health?.system?.platform || "..."} (Py ${health?.system?.python_version || "..."})`}
          icon={<Server className="w-6 h-6" />}
          variant="secondary"
          loading={healthLoading}
        />
      </div>

      {/* Services Latency */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {t("latency")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <LatencyIndicator 
            label={t("database")}
            latency={health?.services?.database?.latency_ms}
            status={health?.services?.database?.status}
            icon={<Database className="w-4 h-4" />}
          />
          <LatencyIndicator 
            label={t("redis")}
            latency={health?.services?.redis?.latency_ms}
            status={health?.services?.redis?.status}
            icon={<Cpu className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* API Metrics Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t("api_metrics")}
          </h2>
          <div className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {metrics?.total_requests || 0} {t("requests")}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricSmallCard 
            label={t("requests")}
            value={metrics?.total_requests || 0}
            trend="+12%"
          />
          <MetricSmallCard 
            label={t("errors")}
            value={metrics?.total_errors || 0}
            variant={metrics?.total_errors > 0 ? "error" : "success"}
          />
          <MetricSmallCard 
            label={t("error_rate")}
            value={`${metrics?.overall_error_rate || 0}%`}
            variant={metrics?.overall_error_rate > 5 ? "error" : "success"}
          />
          <MetricSmallCard 
            label={t("avg_duration")}
            value={`${calculateAvgDuration(metrics?.endpoints)}ms`}
          />
        </div>

        {/* Endpoints Table */}
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("endpoint")}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("requests")}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("avg_duration")}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("error_rate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {metrics?.endpoints && Object.entries(metrics.endpoints).map(([path, data]: [string, any]) => (
                  <tr key={path} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{data.request_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{data.average_duration_ms}ms</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(data.average_duration_ms / 2, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        data.error_rate > 5 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {data.error_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Audit Logs Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("audit_logs")}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("live")}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-4 shadow-sm flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {metrics?.audit_logs?.length > 0 ? (
              metrics.audit_logs
                .map((log: any, idx: number) => (
                  <motion.div 
                    key={log.timestamp + idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px]",
                      log.status_code >= 400 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {log.status_code}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight",
                            getActionColor(log.method)
                          )}>
                            {log.method}
                          </span>
                          <span className="font-bold text-sm truncate">{getFriendlyAction(log.path, log.method)}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{log.path}</span>
                        <span className="text-[10px] text-primary/60 font-black flex items-center gap-1">
                          <UserIcon className="w-2.5 h-2.5" />
                          {log.user || "anonymous"}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {log.duration_ms}ms
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <p className="text-muted-foreground font-bold">{t("no_audit_logs")}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Logs Section (Errors) */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            {t("recent_errors")}
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={t("details")}
              className="bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 transition-all w-48 lg:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-4 shadow-sm flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {metrics?.recent_errors?.length > 0 ? (
              metrics.recent_errors
                .filter((log: any) => 
                  log.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  log.error.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((log: any, idx: number) => (
                  <motion.div 
                    key={log.timestamp + idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-black">{log.status_code}</span>
                          <span className="font-bold text-sm uppercase tracking-tight">{log.method}</span>
                          <span className="text-muted-foreground font-mono text-sm truncate">{log.path}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-red-500/80 font-mono break-all">{log.error}</p>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-bold">{t("no_errors")}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ─── Helper Components ─── */

function getFriendlyAction(path: string, method: string) {
  if (path.includes("/auth/login")) return "User Login";
  if (path.includes("/auth/register")) return "User Registration";
  if (path.includes("/users/me/name")) return "Personal Name Update";
  if (path.includes("/users/me/email")) return "Personal Email Update";
  if (path.includes("/users/me/password")) return "Password Change";
  if (path.startsWith("/users/") && method === "PUT") return "Admin: User Profile Update";
  if (path.startsWith("/users/") && method === "DELETE") return "Admin: Delete User";
  if (path === "/users/" && method === "POST") return "Admin: Create User";
  if (path.includes("/students/me")) return "View Personal Academic Record";
  if (path.startsWith("/students/") && method === "PUT") return "Update Student Record";
  if (path.startsWith("/students/") && method === "PATCH") return "Partial Student Update";
  if (path.startsWith("/students/") && method === "DELETE") return "Delete Student Record";
  if (path === "/students/" && method === "POST") return "Create Student Record";
  if (path.includes("/monitoring/")) return "View System Metrics";
  
  return path;
}

function getActionColor(method: string) {
  switch (method) {
    case "GET": return "bg-blue-500 text-white";
    case "POST": return "bg-emerald-500 text-white";
    case "PUT": return "bg-amber-500 text-white";
    case "PATCH": return "bg-orange-500 text-white";
    case "DELETE": return "bg-red-500 text-white";
    default: return "bg-muted text-muted-foreground";
  }
}


/* ─── Helper Components ─── */

function StatusCard({ title, value, icon, variant, loading }: any) {
  const variants = {
    primary: "from-primary/10 to-primary/5 text-primary",
    secondary: "from-blue-500/10 to-blue-500/5 text-blue-500",
    success: "from-emerald-500/10 to-emerald-500/5 text-emerald-500",
    warning: "from-amber-500/10 to-amber-500/5 text-amber-500",
    error: "from-red-500/10 to-red-500/5 text-red-500",
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br -mr-12 -mt-12 rounded-full blur-3xl opacity-20", variants[variant as keyof typeof variants])} />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5", variants[variant as keyof typeof variants])}>
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        {loading ? (
          <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        ) : (
          <span className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{value}</span>
        )}
      </div>
    </div>
  );
}

function LatencyIndicator({ label, latency, status, icon }: any) {
  const isOnline = status === "online";
  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
          <span className="text-sm font-bold group-hover:text-primary transition-colors">{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-mono text-lg font-black tracking-tighter">
          {latency != null ? `${latency}ms` : "--"}
        </span>
        <div className="w-24 h-1 rounded-full bg-muted mt-1 overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000", latency > 100 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${Math.min((latency || 0) / 2, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricSmallCard({ label, value, variant = "primary", trend }: any) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-1 shadow-sm relative group overflow-hidden">
      <div className={cn(
        "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500",
        variant === "error" ? "bg-red-500" : "bg-primary"
      )} />
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xl font-black tracking-tight",
          variant === "error" && value > 0 && "text-red-500"
        )}>{value}</span>
        {trend && <span className="text-[10px] font-bold text-emerald-500">{trend}</span>}
      </div>
    </div>
  );
}

/* ─── Utils ─── */

function formatUptime(seconds: number | undefined) {
  if (seconds == null) return "...";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function calculateAvgDuration(endpoints: any) {
  if (!endpoints) return 0;
  const values: any[] = Object.values(endpoints);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr.average_duration_ms, 0);
  return (sum / values.length).toFixed(1);
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
