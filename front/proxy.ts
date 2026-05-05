import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Supported locales
const locales = routing.locales; // ['en', 'ar']
const defaultLocale = routing.defaultLocale; // 'ar'

// Helper function to check if a segment is a valid locale
function isLocale(segment: string): segment is 'en' | 'ar' {
  return locales.includes(segment as 'en' | 'ar');
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathSegments = pathname.split('/').filter(Boolean);

  // Check if the path is a static file (has file extension)
  // Only check the last segment to avoid excluding paths with dots in slugs
  const lastSegment = pathSegments[pathSegments.length - 1] || '';
  const isStaticFile =
    lastSegment.includes('.') &&
    /\.(jpg|jpeg|png|gif|svg|ico|webp|pdf|css|js|json|xml|txt|woff|woff2|ttf|eot|mp4|mp3|wav)$/i.test(
      lastSegment
    );

  // Skip processing for excluded paths (including image optimization routes)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/_image') ||
    pathname.startsWith('/_static') ||
    isStaticFile
  ) {
    return intlMiddleware(request);
  }

  // Case: Root path or no locale in path - add default locale
  if (pathSegments.length === 0 || !isLocale(pathSegments[0])) {
    // Get the path without locale, preserving any existing path
    const restOfPath = pathSegments.length === 0 ? '' : pathSegments.join('/');

    // Clone the URL to preserve query parameters and hash
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${defaultLocale}${restOfPath ? `/${restOfPath}` : ''}`;
    return NextResponse.redirect(newUrl);
  }

  // Check for multiple locales in the path
  const localeSegments = pathSegments.filter(segment => isLocale(segment));

  // Case: Multiple locales detected - remove duplicates and keep first valid one
  if (localeSegments.length > 1) {
    const firstLocale = localeSegments[0];
    // Remove all locale segments and rebuild path
    const nonLocaleSegments = pathSegments.filter(
      segment => !isLocale(segment)
    );
    const restOfPath = nonLocaleSegments.join('/');

    // Clone the URL to preserve query parameters and hash
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${firstLocale}${restOfPath ? `/${restOfPath}` : ''}`;
    return NextResponse.redirect(newUrl);
  }

  // Default: Use next-intl middleware for normal locale handling
  return intlMiddleware(request);
}

export const config = {
  // Next.js requires a string literal (not String.raw template) for config.matcher
  // eslint-disable-next-line
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
