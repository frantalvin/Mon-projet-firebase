
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// A list of all locales that are supported
const locales = ['fr']; // KEEPING THIS AS FRENCH ONLY based on user's last functional request

console.log('[[i18n.ts at ROOT]] File loaded and parsed. TOP LEVEL.');

export default getRequestConfig(async ({locale}) => {
  console.log(`[[i18n.ts at ROOT]] getRequestConfig CALLED for locale: ${locale}`);

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[[i18n.ts at ROOT]] Invalid locale: ${locale}. Triggering notFound().`);
    notFound();
  }

  console.log(`[[i18n.ts at ROOT]] Attempting to load messages for locale: ${locale} from ./messages/${locale}.json`);
  try {
    // Ensure the path is relative to the project root, as i18n.ts is at the root.
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`[[i18n.ts at ROOT]] Successfully loaded messages for ${locale}. Message count: ${messages ? Object.keys(messages).length : 'N/A (messages is null/undefined)'}`);
    if (!messages || Object.keys(messages).length === 0) {
      console.warn(`[[i18n.ts at ROOT]] Messages object for locale ${locale} is empty or undefined after import.`);
      // Depending on strictness, you might want to call notFound() here too
      // if empty messages are considered an error.
    }
    return { messages };
  } catch (error: any) {
    console.error(`[[i18n.ts at ROOT]] Failed to load messages for locale ${locale} from ./messages/${locale}.json:`);
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    // This is a critical failure, so we call notFound().
    notFound();
  }
});

