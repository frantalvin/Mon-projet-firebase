
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

  // Using hardcoded messages to test if i18n.ts itself is loaded.
  if (locale === 'fr') {
    console.log('[[i18n.ts at ROOT]] Returning hardcoded French messages.');
    return {
      messages: {
        AppLayout: {
          title: "PatientWise (FR - Hardcoded)",
          settings: "Paramètres (FR - Hardcoded)",
          logout: "Déconnexion (FR - Hardcoded)"
        },
        Navigation: {
          dashboard: "Tableau de bord (FR - Hardcoded)",
          patients: "Patients (FR - Hardcoded)",
          appointments: "Rendez-vous (FR - Hardcoded)"
        },
        ThemeToggle: {
          toggleTheme: "Changer de thème (FR - Hardcoded)",
          light: "Clair (FR - Hardcoded)",
          dark: "Sombre (FR - Hardcoded)",
          system: "Système (FR - Hardcoded)"
        },
        HomePage: {
          loading: "Chargement... (FR - Hardcoded)"
        }
      }
    };
  }

  console.error(`[[i18n.ts at ROOT]] Locale not 'fr', but no other hardcoded messages available. Locale: ${locale}. Triggering notFound().`);
  notFound();
});
