"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Terminal,
  Layers,
  Users,
  ShieldCheck,
  Database,
  Rocket,
  Link as LinkIcon
} from "lucide-react";

export default function ProjectDetailsPage() {
  const t = useTranslations('ProjectDetails');
  const teamT = useTranslations('Team');
  const [activeTab, setActiveTab] = useState<'docker' | 'local'>('docker');

  const team = [
    {
      name: teamT("member_1_name"),
      role: teamT("member_1_role"),
      tasks: teamT.raw("member_1_full_tasks"),
      status: t("status_completed"),
      github: "https://github.com/Mohamediibra7im"
    },
    {
      name: teamT("member_2_name"),
      role: teamT("member_2_role"),
      tasks: teamT.raw("member_2_full_tasks"),
      status: t("status_completed"),
      github: "https://github.com/NayNay74"
    },
    {
      name: teamT("member_3_name"),
      role: teamT("member_3_role"),
      tasks: teamT.raw("member_3_full_tasks"),
      status: t("status_completed"),
      github: "https://github.com/Haidy-Hosam"
    },
    {
      name: teamT("member_4_name"),
      role: teamT("member_4_role"),
      tasks: teamT.raw("member_4_full_tasks"),
      status: t("status_completed"),
      github: "https://github.com/Ahmedsalah0109"
    },
    {
      name: teamT("member_5_name"),
      role: teamT("member_5_role"),
      tasks: teamT.raw("member_5_full_tasks"),
      status: t("status_completed"),
      github: "https://github.com/Ahmedkhairy0106"
    },
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Team Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('team_distribution')}</h2>
          </div>
          <div className="grid gap-4">
            {team.map((m, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold hover:text-primary hover:underline transition-all"
                    >
                      {m.name}
                    </a>
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">{m.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {m.status}
                  </div>
                </div>
                <ul className="grid gap-2">
                  {(m.tasks as string[]).map((task, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Project Goal */}
        <section className="p-8 rounded-[2rem] bg-primary text-white flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6" />
            <h2 className="text-2xl font-bold">{t('project_goal')}</h2>
          </div>
          <p className="text-lg opacity-90 leading-relaxed">
            {t('project_goal_desc')}
          </p>
        </section>

        {/* Features Roadmap */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('features_roadmap')}</h2>
            </div>
            <ul className="flex flex-col gap-4">
              {t.raw('features_list').map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6 p-8 rounded-[2rem] border border-border">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('roles')}</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-bold">{t('role_admin_title')}</span>
                <p className="text-sm text-muted-foreground">{t('role_admin_desc')}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold">{t('role_student_title')}</span>
                <p className="text-sm text-muted-foreground">{t('role_student_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{t('how_to_run')}</h2>
            </div>
            <div className="flex bg-muted rounded-lg p-1 text-[10px] font-bold uppercase tracking-tighter">
              <button 
                onClick={() => setActiveTab('docker')}
                className={`px-3 py-1 rounded-md transition-all ${activeTab === 'docker' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Docker
              </button>
              <button 
                onClick={() => setActiveTab('local')}
                className={`px-3 py-1 rounded-md transition-all ${activeTab === 'local' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                Local
              </button>
            </div>
          </div>
          
          <div className="bg-[#0f1117] rounded-2xl p-6 font-mono text-[12px] md:text-sm border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
            
            {activeTab === 'docker' ? (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground opacity-40"># Run with Docker</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-white">docker compose up -d --build</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {[
                  { t: t('local_setup.step_1_title'), c: t('local_setup.step_1_cmd') },
                  { t: t('local_setup.step_2_title'), w: t('local_setup.step_2_win'), u: t('local_setup.step_2_unix') },
                  { t: t('local_setup.step_3_title'), c: t('local_setup.step_3_cmd') },
                  { t: t('local_setup.step_4_title'), d: t('local_setup.step_4_desc') },
                  { t: t('local_setup.step_5_title'), c: t('local_setup.step_5_cmd') },
                  { t: t('local_setup.step_6_title'), c: t('local_setup.step_6_cmd') },
                  { t: t('local_setup.step_7_title'), c: t('local_setup.step_7_cmd') },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-muted-foreground opacity-40"># {i+1}. {s.t}</span>
                    {s.c && <div className="flex items-center gap-2"><span className="text-primary opacity-50">$</span><span className="text-white">{s.c}</span></div>}
                    {s.w && <div className="flex flex-col ml-4 opacity-80"><span className="text-blue-400/50">// Windows:</span><span className="text-white">{s.w}</span></div>}
                    {s.u && <div className="flex flex-col ml-4 opacity-80 mt-1"><span className="text-blue-400/50">// Unix:</span><span className="text-white">{s.u}</span></div>}
                    {s.d && <span className="text-white/60 italic ml-4">// {s.d}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Access Links */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('access_links')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="http://127.0.0.1:8000/docs" target="_blank" className="p-4 rounded-xl border border-border hover:bg-muted transition-all flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase">Interactive Docs</span>
              <span className="text-sm truncate">/docs</span>
            </a>
            <a href="http://127.0.0.1:8000/monitoring/dashboard" target="_blank" className="p-4 rounded-xl border border-border hover:bg-muted transition-all flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase">Monitoring</span>
              <span className="text-sm truncate">/monitoring/dashboard</span>
            </a>
            <a href="http://127.0.0.1:8000/monitoring/metrics" target="_blank" className="p-4 rounded-xl border border-border hover:bg-muted transition-all flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase">Metrics JSON</span>
              <span className="text-sm truncate">/monitoring/metrics</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
