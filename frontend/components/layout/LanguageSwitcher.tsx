'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface LanguageSwitcherProps {
  className?: string;
  hideLabel?: boolean;
}

export function LanguageSwitcher({
  className,
  hideLabel,
}: LanguageSwitcherProps) {
  const params = useParams();
  const locale = params?.locale as string;
  const currentLocale = (locale as 'en' | 'ar') || 'en';

  const handleToggleLocale = () => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';

    // Get current pathname from browser
    const currentPath = window.location.pathname;

    // Split by current locale to get the path without locale
    // e.g., "/en/admin/users" -> ["", "admin/users"]
    const pathParts = currentPath.split(`/${currentLocale}`);
    const pathWithoutLocale =
      pathParts.length > 1
        ? pathParts[1] || '/'
        : currentPath.startsWith('/')
          ? currentPath.slice(1)
          : currentPath;

    // Ensure the path starts with / and normalize it
    const normalizedPath = pathWithoutLocale.startsWith('/')
      ? pathWithoutLocale
      : `/${pathWithoutLocale}`;

    // Construct the new path with the new locale
    const newPath =
      normalizedPath === '/'
        ? `/${newLocale}`
        : `/${newLocale}${normalizedPath}`;

    // Preserve query parameters and hash if any
    const searchParams = window.location.search;
    const hash = window.location.hash;
    const newUrl = `${newPath}${searchParams}${hash}`;

    // Navigate to the new locale path using window.location for reliability
    window.location.href = newUrl;
  };

  const t = useTranslations('Header');

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleToggleLocale}
      className={cn(
        'h-11 px-5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 gap-2',
        className
      )}
      title={t('switchLanguage', {
        language: currentLocale === 'en' ? 'العربية' : 'English',
      })}
    >
      <Globe className='h-[18px] w-[18px]' />
      {!hideLabel && (
        <span className='text-xs font-semibold uppercase'>
          {currentLocale === 'ar' ? 'AR' : currentLocale.toUpperCase()}
        </span>
      )}
      <span className='sr-only'>{t('toggleLanguage')}</span>
    </Button>
  );
}
