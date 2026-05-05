"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export function FinalCTA() {
  const t = useTranslations('HomePage');

  return (
    <section className="py-24 px-8">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to Transform Your <br /> Management?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="px-10 py-5 rounded-2xl bg-white text-primary font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
              {t('cta_primary')}
            </Link>
            <Link href="/project-details" className="px-10 py-5 rounded-2xl bg-primary-foreground/10 border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-all">
              {t('cta_secondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
