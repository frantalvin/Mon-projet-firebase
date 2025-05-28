
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// A list of all locales that are supported
const locales = ['fr'];

console.log('[src/i18n.ts] File loaded and parsed. TOP LEVEL.');

export default getRequestConfig(async ({locale}) => {
  console.log(`[src/i18n.ts] getRequestConfig CALLED for locale: ${locale}`);

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[src/i18n.ts] Invalid locale: ${locale}. Triggering notFound.`);
    notFound();
  }

  try {
    // Path from src/i18n.ts to messages/ at root is ../messages/
    // The messages directory is at the project root.
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log(`[src/i18n.ts] Successfully loaded messages for ${locale}. Message count: ${messages && Object.keys(messages).length}`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[src/i18n.ts] Error loading messages for locale ${locale}:`, error);
    // If message files are not found, trigger a 404.
    notFound();
  }
});

