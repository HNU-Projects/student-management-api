"use client";

import { useTranslations } from 'next-intl';
import { LineChart, Shield, Users, FileText } from "lucide-react";

export function Features() {
  const t = useTranslations('HomePage');

  const features = [
    { titleKey: "feature_1_title", descKey: "feature_1_desc", icon: LineChart },
    { titleKey: "feature_2_title", descKey: "feature_2_desc", icon: Shield },
    { titleKey: "feature_3_title", descKey: "feature_3_desc", icon: Users },
    { titleKey: "feature_4_title", descKey: "feature_4_desc", icon: FileText },
  ];

  return (
    <section id="features" className="py-24 px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            {t('features_title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t('features_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">{t(f.titleKey as any)}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(f.descKey as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
