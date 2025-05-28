import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['fr'],

  // Used when no locale matches
  defaultLocale: 'fr',
  localePrefix: 'as-needed' // Options: 'always', 'as-needed', 'never'
});

export const config = {
  // Match only internationalized pathnames
  // Skip middleware for API routes, static files, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
