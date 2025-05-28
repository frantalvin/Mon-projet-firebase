
// i18n.ts (at project root)
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// A list of all locales that are supported
const locales = ['fr'];

console.log('[i18n.ts at ROOT] File loaded and parsed. TOP LEVEL.'); // New log

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts at ROOT] getRequestConfig CALLED for locale: ${locale}`); // Existing log

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts at ROOT] Invalid locale: ${locale}. Triggering notFound.`);
    notFound();
  }

  try {
    // Path is now relative to the project root, as messages/ is at root
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`[i18n.ts at ROOT] Successfully loaded messages for ${locale}. Message count: ${messages && Object.keys(messages).length}`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts at ROOT] Error loading messages for locale ${locale}:`, error);
    // If message files are not found, trigger a 404.
    notFound();
  }
});
