"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations('HomePage');

  if (pathname?.includes("/dashboard") || pathname?.includes("/profile")) return null;


  return (
    <footer className="py-12 px-8 border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold">StudentFlow</span>
        </div>
        <p className="text-sm text-foreground/50">
          {t('footer_copyright')}
        </p>
        <div className="flex gap-6 text-sm font-medium text-foreground/60">
          <a 
            href="https://github.com/Mohamediibra7im/student-management-api" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-primary transition-colors"
          >
            {t('footer_github')}
          </a>
        </div>
      </div>
    </footer>
  );
}
