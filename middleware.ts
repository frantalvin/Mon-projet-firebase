import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Une liste de toutes les locales qui sont prises en charge
  locales: ['fr'],

  // Utilisé lorsque aucune locale n'est trouvée
  defaultLocale: 'fr',
  localePrefix: 'as-needed' // Pour ne pas avoir /fr pour la langue par défaut
});

export const config = {
  // Correspond à tous les chemins sauf ceux qui commencent par :
  // - api (chemins API)
  // - _next/static (fichiers statiques)
  // - _next/image (optimisation d'images)
  // - favicon.ico (fichier favicon)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
