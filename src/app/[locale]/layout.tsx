
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css'; // Ajustement du chemin si globals.css est dans src/app
import { AppProvider } from '@/contexts/app-context';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata: Metadata = { // Metadata peut être générée dynamiquement
//   title: 'PatientWise',
//   description: 'Intelligent Patient Management System',
// };

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({params: {locale}}: RootLayoutProps): Promise<Metadata> {
  // Optionnel : Charger les traductions pour le titre si nécessaire
  // const t = await getTranslations({locale, namespace: 'Metadata'});
  // return {
  //   title: t('title')
  // };
  return {
    title: 'PatientWise', // Pour l'instant, gardons un titre statique
    description: 'Système intelligent de gestion des patients',
  }
}

const supportedLocales = ['fr'];

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {

  console.log(`[[RootLayout]] Rendering for locale: ${locale}`);

  if (!supportedLocales.includes(locale)) {
    console.error(`[[RootLayout]] Invalid locale detected in layout: ${locale}. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    console.log(`[[RootLayout]] Attempting to get messages for locale: ${locale} using getMessages({ locale })`);
    messages = await getMessages({ locale });
    console.log(`[[RootLayout]] Successfully got messages for locale: ${locale}. Message count: ${messages && Object.keys(messages).length}. First key: ${messages && Object.keys(messages)[0]}`);
    if (messages && Object.keys(messages).length === 0 && locale === 'fr') {
      console.warn(`[[RootLayout]] getMessages returned an empty object for locale: ${locale} (French). This indicates an issue with messages/fr.json or its loading.`);
    }
  } catch (error: any) {
    console.error(`[[RootLayout]] Error calling getMessages for locale ${locale}:`);
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    if (error.message && error.message.includes("Couldn't find next-intl config file")) {
        console.error("[[RootLayout]] CRITICAL: next-intl config file (expected at root i18n.ts) was not found or processed by next-intl/server. Ensure i18n.ts exists at the project root and is correctly structured. Also, check tsconfig.json baseUrl if applicable.");
    }
    console.error('[[RootLayout]] Triggering notFound() due to error in getMessages.');
    notFound();
  }

  if (!messages) { 
    console.error(`[[RootLayout]] Messages are undefined or null for locale: ${locale} after getMessages call. Content:`, messages);
    console.error(`[[RootLayout]] This usually indicates an issue with the root i18n.ts (e.g., it called notFound() itself or getMessages failed catastrophically). Calling notFound().`);
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider>
              {children}
              <Toaster />
            </AppProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
