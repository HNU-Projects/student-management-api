"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('HomePage');

  const students = [
    { name: "Ahmed Hassan", dept: "CS", gpa: "3.95", statusKey: "status_active" as const, color: "text-green-500" },
    { name: "Sara Mohamed", dept: "Engineering", gpa: "3.87", statusKey: "status_active" as const, color: "text-green-500" },
    { name: "Omar Ali", dept: "Business", gpa: "3.42", statusKey: "status_probation" as const, color: "text-yellow-500" },
  ];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center px-8">
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-balance">
            {t('title').split(' ').map((word, i) => i === 0 ? word + ' ' : <span key={i} className="text-primary italic">{word} </span>)}
          </h1>
          <p className="text-lg text-foreground/70 max-w-lg leading-relaxed">
            {t('description')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="relative px-8 py-4 rounded-xl bg-primary text-white font-semibold overflow-hidden group transition-all shadow-xl shadow-primary/30">
              <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl" />
              <span className="relative z-10">{t('cta_primary')}</span>
            </Link>
            <Link href="/project-details" className="relative px-8 py-4 rounded-xl border border-border bg-card font-semibold overflow-hidden group transition-all">
              <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">{t('cta_secondary')}</span>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse"></div>
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden group">
            {/* Dashboard Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{t('dashboard_url')}</span>
              <div className="w-16"></div>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{t('stat_total')}</span>
                  <span className="text-xl font-black text-primary">{t('stat_total_value')}</span>
                  <span className="text-[9px] text-green-500 font-bold">{t('stat_total_trend')}</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{t('stat_gpa')}</span>
                  <span className="text-xl font-black text-foreground">{t('stat_gpa_value')}</span>
                  <span className="text-[9px] text-green-500 font-bold">{t('stat_gpa_trend')}</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{t('stat_active')}</span>
                  <span className="text-xl font-black text-foreground">{t('stat_active_value')}</span>
                  <span className="text-[9px] text-muted-foreground font-medium">{t('stat_active_trend')}</span>
                </div>
              </div>

              {/* Mini Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-2 border-b border-border">
                  <span>{t('table_name')}</span>
                  <span>{t('table_dept')}</span>
                  <span>{t('table_gpa')}</span>
                  <span>{t('table_status')}</span>
                </div>
                {students.map((s, i) => (
                  <div key={i} className="grid grid-cols-4 gap-0 text-[10px] px-3 py-2 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
                    <span className="font-semibold text-foreground truncate">{s.name}</span>
                    <span className="text-muted-foreground">{s.dept}</span>
                    <span className="font-bold text-foreground">{s.gpa}</span>
                    <span className={`font-bold ${s.color}`}>{t(s.statusKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
