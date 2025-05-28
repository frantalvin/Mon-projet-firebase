
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css'; // Adjusted path
import { AppProvider } from '@/contexts/app-context';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PatientWise',
  description: 'Intelligent Patient Management System',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

const supportedLocales = ['fr']; // Only French

export default async function RootLayout({
  children,
  params: { locale }, // Destructure locale directly
}: Readonly<RootLayoutProps>) {

  console.log(`[RootLayout] Rendering for locale: ${locale}`);

  if (!supportedLocales.includes(locale)) {
    console.error(`[RootLayout] Invalid locale detected: ${locale}. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    console.log(`[RootLayout] Attempting to get messages for locale: ${locale} using getMessages({ locale })`);
    messages = await getMessages({ locale });
    console.log(`[RootLayout] Successfully got messages for locale: ${locale}. Message count: ${messages && Object.keys(messages).length}`);
  } catch (error) {
    console.error(`[RootLayout] Error calling getMessages for locale ${locale}:`, error);
    if ((error as Error).message.includes("Couldn't find next-intl config file")) {
        console.error("[RootLayout] CRITICAL: next-intl config file (i18n.ts at root or src/i18n.ts) not found by next-intl/server. Check build/runtime path resolution. Ensure tsconfig.json baseUrl is set if needed.");
    }
    notFound();
  }

  if (!messages || Object.keys(messages).length === 0) {
    // This case handles if getMessages returns undefined, null, or empty object without throwing an error.
    // This might happen if i18n.ts is found but then internally calls notFound() before returning messages.
    console.error(`[RootLayout] Messages are undefined, null, or empty for locale: ${locale} after getMessages call. Content:`, messages);
    console.error(`[RootLayout] This might indicate an issue with i18n.ts (e.g., it called notFound()) or the message files for locale: ${locale}. Calling notFound().`);
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
