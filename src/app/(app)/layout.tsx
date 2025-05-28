import { Navigation } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Navigation />
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
          {/* Mobile Navigation Trigger is inside Navigation component */}
          <div className="flex-1">
            {/* Optional: Add breadcrumbs or page title here */}
          </div>
          <ThemeToggle />
          <Button variant="outline" size="icon" className="ml-auto">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
