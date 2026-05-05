import '../globals.css';
import { Metadata, Viewport } from 'next';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/layout/providers';
import { ReactNode } from 'react';
import { Cairo } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'StudentFlow';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: {
      default: `${projectName} - Student Management System`,
      template: `%s | ${projectName}`,
    },
    description: `${projectName} is a modern student management system.`,
    keywords: `${projectName}, LMS, Education, Learning`,
    openGraph: {
      title: projectName,
      description: `${projectName} is a modern student management system.`,
      url: siteUrl,
      siteName: projectName,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: projectName,
        },
      ],
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: projectName,
      description: `${projectName} is a modern student management system.`,
      images: [`${siteUrl}/og-image.png`],
      site: siteUrl,
      creator: `@${projectName.toLowerCase()}`,
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
      ],
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Fetch messages for the locale
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body className={`${cairo.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers locale={locale} messages={messages}>
          <Toaster
            position='bottom-right'
            expand={true}
            richColors={true}
            closeButton={true}
          />
          <Header />
          <main className="flex-1">
            <RoleProtectedRoute>
              {children}
            </RoleProtectedRoute>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
