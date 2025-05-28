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
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<RootLayoutProps>) {
  console.log(`[[RootLayout]] Rendering for locale: ${locale}`);

  let messages: any; // Use 'any' for now to be flexible with potential errors
  let messagesLoadedSuccessfully = false;

  try {
    console.log(`[[RootLayout]] Attempting to get messages for locale: ${locale} using getMessages({ locale })`);
    messages = await getMessages({ locale });
    if (messages && Object.keys(messages).length > 0) {
      messagesLoadedSuccessfully = true;
      console.log(`[[RootLayout]] Successfully got messages for locale: ${locale}. Message count: ${Object.keys(messages).length}`);
    } else {
      console.warn(`[[RootLayout]] Got messages for locale: ${locale}, but the messages object is empty or invalid.`);
      messages = {}; // Fallback
    }
  } catch (error) {
    console.error(`[[RootLayout]] Error calling getMessages for locale ${locale}:`, error);
    messages = {}; // Fallback to empty messages
    console.log(`[[RootLayout]] Using fallback empty messages for locale: ${locale} due to error during getMessages.`);
  }

  if (!messagesLoadedSuccessfully) {
    console.warn(`[[RootLayout]] FINAL CHECK: Messages were NOT loaded successfully for locale ${locale}. Using fallback empty messages for NextIntlClientProvider.`);
    // Ensure messages is an object if it somehow became otherwise
    if (typeof messages !== 'object' || messages === null) {
        messages = {};
    }
  }

  console.log(`[[RootLayout]] Passing to NextIntlClientProvider - locale: ${locale}, message keys: ${Object.keys(messages).join(', ') || 'NONE (empty messages)'}`);

  return (
    <html lang={locale} suppressHydrationWarning>
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
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
