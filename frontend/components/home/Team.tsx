"use client";

import { useTranslations } from 'next-intl';
import { UserCircle2 } from "lucide-react";

export function Team() {
  const t = useTranslations('HomePage');
  const teamT = useTranslations('Team');

  const members = [
    { name: teamT("member_1_name"), role: teamT("member_1_role"), tasks: teamT("member_1_tasks"), github: "https://github.com/Mohamediibra7im" },
    { name: teamT("member_2_name"), role: teamT("member_2_role"), tasks: teamT("member_2_tasks"), github: "https://github.com/NayNay74" },
    { name: teamT("member_3_name"), role: teamT("member_3_role"), tasks: teamT("member_3_tasks"), github: "https://github.com/Haidy-Hosam" },
    { name: teamT("member_4_name"), role: teamT("member_4_role"), tasks: teamT("member_4_tasks"), github: "https://github.com/Ahmedsalah0109" },
    { name: teamT("member_5_name"), role: teamT("member_5_role"), tasks: teamT("member_5_tasks"), github: "https://github.com/Ahmedkhairy0106", isSpecial: true },
  ];

  return (
    <section id="team" className="py-24 px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            {t('team_title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t('team_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {members.map((m, i) => (
            <div key={i} className={`group p-6 rounded-2xl bg-card border transition-all flex flex-col items-center text-center gap-4 ${m.isSpecial ? 'border-primary shadow-xl shadow-primary/10 relative scale-105 z-10' : 'border-border hover:border-primary/50'}`}>
              {m.isSpecial && (
                <div className="absolute -top-3 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-tighter rounded-full shadow-lg">
                  Frontend Specialist
                </div>
              )}
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <UserCircle2 className="w-10 h-10" />
              </div>
              <div className="flex flex-col gap-1">
                <a 
                  href={m.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-lg font-bold hover:text-primary hover:underline transition-all"
                >
                  {m.name}
                </a>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{m.role}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                {m.tasks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
