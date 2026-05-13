'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('Theme');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Avoid hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <Button
        variant='ghost'
        size='icon'
        className={cn(
          'group relative h-11 w-11 rounded-xl bg-transparent hover:bg-primary/5',
          className
        )}
      >
        <div className='h-[1.2rem] w-[1.2rem]' />
        <span className='sr-only'>{t('toggle')}</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className={cn(
        'group relative h-11 w-11 rounded-xl bg-transparent hover:bg-primary/5',
        className
      )}
      aria-label={t('toggle')}
    >
      <Sun
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.1rem] w-[1.1rem] transition-all duration-300 ease-in-out text-primary',
          'rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0'
        )}
      />
      <Moon
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.1rem] w-[1.1rem] transition-all duration-300 ease-in-out text-primary',
          'rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100'
        )}
      />
      <span className='sr-only'>{t('toggle')}</span>
    </Button>
  );
}
