
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'fr'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts] Invalid locale: ${locale}. Triggering notFound.`);
    notFound();
  }

  console.log(`[i18n.ts] getRequestConfig called for locale: ${locale}`);

  // Using minimal hardcoded messages to test config loading
  let messages;
  if (locale === 'en') {
    messages = {
      AppLayout: {
        title: "PatientWise (EN Test)",
        settings: "Settings",
        logout: "Log Out"
      },
      Navigation: {
        dashboard: "Dashboard",
        patients: "Patients",
        appointments: "Appointments"
      },
      ThemeToggle: {
        toggleTheme: "Toggle theme",
        light: "Light",
        dark: "Dark",
        system: "System"
      },
      LanguageSwitcher: {
        changeLanguage: "Change language",
        english: "English",
        french: "Français"
      },
      HomePage: {
        loading: "Loading..."
      }
    };
  } else if (locale === 'fr') {
    messages = {
      AppLayout: {
        title: "PatientWise (FR Test)",
        settings: "Paramètres",
        logout: "Déconnexion"
      },
      Navigation: {
        dashboard: "Tableau de bord",
        patients: "Patients",
        appointments: "Rendez-vous"
      },
      ThemeToggle: {
        toggleTheme: "Changer de thème",
        light: "Clair",
        dark: "Sombre",
        system: "Système"
      },
      LanguageSwitcher: {
        changeLanguage: "Changer de langue",
        english: "English",
        french: "Français"
      },
      HomePage: {
        loading: "Chargement..."
      }
    };
  } else {
    // Fallback for unknown locales, though middleware should prevent this
    console.error(`[i18n.ts] Unknown locale: ${locale} after initial check. This should not happen.`);
    messages = {};
  }

  return {
    messages
  };
});
