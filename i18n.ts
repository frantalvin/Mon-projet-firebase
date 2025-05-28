
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Configurer les langues que vous souhaitez prendre en charge
const locales = ['fr'];

console.log(`[[i18n.ts at ROOT]] File loaded and parsed. TOP LEVEL. Supported locales: ${locales.join(', ')}`);

// Messages français codés en dur pour le diagnostic
const hardcodedFrMessages = {
  AppLayout: {
    title: "PatientWise (FR-HC)", // HC for Hardcoded
    settings: "Paramètres (FR-HC)",
    logout: "Déconnexion (FR-HC)"
  },
  Navigation: {
    dashboard: "Tableau de Bord (FR-HC)",
    patients: "Patients (FR-HC)",
    appointments: "Rendez-vous (FR-HC)"
  },
  ThemeToggle: {
    toggleTheme: "Changer de thème (FR-HC)",
    light: "Clair (FR-HC)",
    dark: "Sombre (FR-HC)",
    system: "Système (FR-HC)"
  },
  DashboardPage: { // Adding some keys for dashboard page as well
    loading: "Chargement... (FR-HC)",
    totalPatientsTitle: "Total Patients (FR-HC)",
  }
};

console.log(`[[i18n.ts at ROOT]] Hardcoded frMessages defined. Keys: ${Object.keys(hardcodedFrMessages).length}`);

export default getRequestConfig(async ({locale}) => {
  console.log(`[[i18n.ts at ROOT]] getRequestConfig CALLED for locale: ${locale}`);

  // Validez que la locale extraite de l'URL est prise en charge (uniquement 'fr' ici)
  if (!locales.includes(locale as any)) {
    console.error(`[[i18n.ts at ROOT]] Invalid locale received: "${locale}". Expected one of: ${locales.join(', ')}. Calling notFound().`);
    notFound();
  }

  console.log(`[[i18n.ts at ROOT]] Locale "${locale}" is valid. Providing hardcoded messages for 'fr' locale.`);
  return {
    messages: hardcodedFrMessages // Pour l'instant, nous ne servons que 'fr'
  };
});
