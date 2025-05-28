
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css'; // Adjusted path
import { AppProvider } from '@/contexts/app-context';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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

export default async function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  // Explicitly pass the locale from params to getMessages
  // and ensure params is awaited if it's a promise (though Next.js usually resolves it)
  const resolvedParams = await params;
  const messages = await getMessages({ locale: resolvedParams.locale });

  return (
    <html lang={resolvedParams.locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <NextIntlClientProvider locale={resolvedParams.locale} messages={messages}>
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
