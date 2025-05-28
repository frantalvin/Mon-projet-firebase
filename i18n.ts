import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import frMessages from './messages/fr.json'; // Direct static import

// Configurez les langues que vous souhaitez prendre en charge
const locales = ['fr'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[[i18n.ts at ROOT]] getRequestConfig CALLED for locale: ${locale}`);

  // Validez que la locale extraite de l'URL est prise en charge (uniquement 'fr' ici)
  if (locale !== 'fr') {
    console.error(`[[i18n.ts at ROOT]] Invalid locale: ${locale}. Expected 'fr'. Calling notFound().`);
    notFound();
  }

  // Fournir les messages pour 'fr' directement
  console.log(`[[i18n.ts at ROOT]] Providing messages for 'fr' locale directly via static import.`);
  return {
    messages: frMessages
  };
});

console.log(`[[i18n.ts at ROOT]] File loaded and parsed. TOP LEVEL. Supported locales: ${locales.join(', ')}`);
console.log(`[[i18n.ts at ROOT]] frMessages loaded: ${frMessages ? Object.keys(frMessages).length + ' keys' : 'NOT LOADED'}`);
