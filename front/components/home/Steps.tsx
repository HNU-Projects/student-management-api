"use client";

import { useTranslations } from 'next-intl';
import { UserPlus, Database, BarChart3 } from "lucide-react";

export function Steps() {
  const t = useTranslations('HomePage');

  const steps = [
    { titleKey: "step_1_title", descKey: "step_1_desc", icon: UserPlus, number: "01" },
    { titleKey: "step_2_title", descKey: "step_2_desc", icon: Database, number: "02" },
    { titleKey: "step_3_title", descKey: "step_3_desc", icon: BarChart3, number: "03" },
  ];

  return (
    <section id="steps" className="py-24 px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {t('steps_title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />

          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center gap-6 group">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary shadow-xl group-hover:border-primary group-hover:scale-110 transition-all duration-500">
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {s.number}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">{t(s.titleKey as any)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
                  {t(s.descKey as any)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
