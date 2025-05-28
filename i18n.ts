import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Configurez les langues que vous souhaitez prendre en charge
const locales = ['fr'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[[i18n.ts at ROOT]] getRequestConfig CALLED for locale: ${locale}`);

  // Validez que la locale extraite de l'URL est prise en charge
  if (!locales.includes(locale as any)) {
    console.error(`[[i18n.ts at ROOT]] Invalid locale: ${locale}. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    console.log(`[[i18n.ts at ROOT]] Attempting to load messages for locale: ${locale} from ./messages/${locale}.json`);
    messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`[[i18n.ts at ROOT]] Successfully loaded messages for locale: ${locale}. Message count: ${messages ? Object.keys(messages).length : 'N/A'}`);
  } catch (error) {
    console.error(`[[i18n.ts at ROOT]] FAILED to load messages for locale: ${locale}. Error:`, error);
    // Si les messages pour une locale valide (fr) ne peuvent pas être chargés, c'est un problème critique.
    // Vous pourriez vouloir afficher une page d'erreur ou utiliser des messages de secours.
    // Pour l'instant, nous allons propager notFound() pour indiquer que cette configuration de locale est problématique.
    notFound();
  }

  return {
    messages
  };
});

console.log(`[[i18n.ts at ROOT]] File loaded and parsed. TOP LEVEL. Supported locales: ${locales.join(', ')}`);
