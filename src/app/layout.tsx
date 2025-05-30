import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProvider } from '@/contexts/app-context'; // Réactivé
import { Toaster } from '@/components/ui/toaster'; // Réactivé
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PatientWise',
  description: 'Intelligent Patient Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          forcedTheme="light" // Garder pour forcer le thème clair pour le débogage
          enableSystem={false} // Garder désactivé pour le débogage
          disableTransitionOnChange // Garder pour éviter les transitions pendant le débogage
        >
          <AppProvider> {/* Réactivé */}
            {children}
            <Toaster /> {/* Réactivé */}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
