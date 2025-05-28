import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['fr'],

  // Used when no locale matches
  defaultLocale: 'fr',
  localePrefix: 'never' // Explicitly set to 'never' as French is the only locale
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};