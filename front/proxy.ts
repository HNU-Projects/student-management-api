import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  return handleI18n(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (static files)
    // - _vercel (Vercel internals)
    // - Static files (e.g. /favicon.ico, /favicon.png, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
