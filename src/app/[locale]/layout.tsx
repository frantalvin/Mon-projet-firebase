
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProvider } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// TODO: Localize metadata properly if i18n setup works
export const metadata: Metadata = {
  title: 'PatientWise',
  description: 'Intelligent Patient Management System',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string }; // Assurez-vous que 'params' est bien typé
}

export default async function RootLayout({
  children,
  params, // Gardez params comme un objet
}: Readonly<RootLayoutProps>) {
  const locale = params.locale; // Extrayez locale de params
  console.log(`[[RootLayout]] Rendering. PARAMS received: ${JSON.stringify(params)}`);
  console.log(`[[RootLayout]] Extracted locale from params: "${locale}"`);

  if (!locale || typeof locale !== 'string') {
    console.error(`[[RootLayout]] INVALID OR MISSING LOCALE in params: "${locale}". This will cause problems with getMessages.`);
    // Si la locale est invalide ici, getMessages échouera probablement ou i18n.ts appellera notFound().
  }

  let messages: any;
  let messagesLoadedSuccessfully = false;

  try {
    console.log(`[[RootLayout]] Attempting to get messages for locale: "${locale}" using getMessages({ locale })`);
    // Assurez-vous que 'locale' est une chaîne valide avant de l'utiliser
    if (typeof locale === 'string' && locale.length > 0) {
      messages = await getMessages({ locale });
      if (messages && Object.keys(messages).length > 0) {
        messagesLoadedSuccessfully = true;
        console.log(`[[RootLayout]] Successfully got messages for locale: "${locale}". Message count: ${Object.keys(messages).length}`);
      } else {
        console.warn(`[[RootLayout]] Got messages for locale: "${locale}", but the messages object is empty or invalid.`);
        messages = {}; // Fallback
      }
    } else {
      console.error(`[[RootLayout]] Cannot call getMessages because locale is invalid: "${locale}"`);
      messages = {}; // Fallback
    }
  } catch (error: any) {
    console.error(`[[RootLayout]] Error calling getMessages for locale "${locale}":`, error.message);
    // Si l'erreur est due à notFound() appelé par i18n.ts, cette partie ne sera pas atteinte car notFound() interrompt le rendu.
    messages = {}; // Fallback to empty messages
    console.log(`[[RootLayout]] Using fallback empty messages for locale: "${locale}" due to error during getMessages.`);
  }

  if (!messagesLoadedSuccessfully) {
    console.warn(`[[RootLayout]] FINAL CHECK: Messages were NOT loaded successfully for locale "${locale}". Using fallback empty messages for NextIntlClientProvider.`);
    if (typeof messages !== 'object' || messages === null) {
        messages = {};
    }
  }

  console.log(`[[RootLayout]] Passing to NextIntlClientProvider - locale: "${locale}", message keys: ${messages ? Object.keys(messages).join(', ') : 'NONE (empty or null messages)'}`);

  // Si locale n'est pas une chaîne valide, NextIntlClientProvider pourrait aussi avoir des problèmes.
  // Il est préférable d'avoir une locale valide.
  const validLocaleForProvider = (typeof locale === 'string' && locale.length > 0) ? locale : 'fr'; // Fallback à 'fr' si invalide
  if (locale !== validLocaleForProvider) {
    console.warn(`[[RootLayout]] Locale for NextIntlClientProvider was invalid ("${locale}"), using fallback "${validLocaleForProvider}".`)
  }

  return (
    <html lang={validLocaleForProvider} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <NextIntlClientProvider locale={validLocaleForProvider} messages={messages}>
              {children}
            </NextIntlClientProvider>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
