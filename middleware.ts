
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  console.log('[[middleware.ts]] EXECUTING');
  console.log('[[middleware.ts]] Request pathname:', request.nextUrl.pathname);
  // La propriété 'locale' sur NextURL n'est pas toujours initialisée avant que le handler next-intl ne s'exécute.
  // Elle est principalement utilisée par Next.js pour sa propre fonctionnalité i18n de routage,
  // que next-intl remplace/gère.

  const handleI18nRouting = createMiddleware({
    locales: ['fr'],
    defaultLocale: 'fr',
    localePrefix: 'never' // Le français est la seule langue, pas besoin de préfixe.
  });

  const response = handleI18nRouting(request);

  // Vérifions si next-intl a ajouté un header pour indiquer la locale qu'il a déterminée.
  // Ceci est plus fiable que request.nextUrl.locale avant l'appel à createMiddleware.
  if (response.headers.has('x-next-intl-locale')) {
    console.log('[[middleware.ts]] Locale determined by next-intl:', response.headers.get('x-next-intl-locale'));
  } else {
    console.log('[[middleware.ts]] x-next-intl-locale header NOT SET by handler.');
  }
  console.log('[[middleware.ts]] Response status from next-intl handler:', response.status);
  if (response.headers.get('location')) {
    console.log('[[middleware.ts]] Response redirect location:', response.headers.get('location'));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
