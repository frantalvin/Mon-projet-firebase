
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader, // Importer SheetHeader
  SheetTitle, // Importer SheetTitle
  SheetFooter // Importer SheetFooter pour la structure
} from '@/components/ui/sheet';
import {
  Sidebar as AppSidebar,
  SidebarHeader as AppSidebarHeader,
  SidebarTitle as AppSidebarTitle,
  SidebarBody as AppSidebarBody,
  SidebarFooter as AppSidebarFooter,
  SidebarNav,
  SidebarNavMain,
  SidebarNavLink,
} from '@/components/ui/sidebar';
import { LayoutDashboard, UsersRound, CalendarDays, Menu, LineChart, ShieldCheck, BrainCircuit } from 'lucide-react';

interface NavItem {
  query: string;
  label: string;
  icon: React.ElementType;
}

export function Navigation() {
  const pathname = usePathname(); // Utilise next/navigation
  const searchParams = useSearchParams(); // Utilise next/navigation
  const activeTab = searchParams.get('tab') || 'dashboard';

  const navItems: NavItem[] = [
    { query: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { query: 'patients', label: 'Patients', icon: UsersRound },
    { query: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
    // { query: 'statistics', label: 'Statistiques', icon: LineChart }, // Removed as per previous request
    // { query: 'admin', label: 'Admin', icon: ShieldCheck }, // Removed as per previous request
  ];

  const getHref = (tabQuery: string) => {
    // En supposant que toutes ces pages sont maintenant des onglets sous /dashboard
    return `/dashboard?tab=${tabQuery}`;
  };

  const navContent = (isSheet = false) => (
    <SidebarNav>
      <SidebarNavMain>
        {navItems.map((item) => {
          const href = getHref(item.query);
          const isActive = activeTab === item.query;

          if (isSheet) {
            return (
              <SheetClose asChild key={item.query}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </SheetClose>
            );
          } else {
            return (
              <SidebarNavLink
                key={item.query}
                href={href}
                active={isActive}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </SidebarNavLink>
            );
          }
        })}
      </SidebarNavMain>
    </SidebarNav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <AppSidebar className="hidden lg:flex lg:flex-col border-r">
        <AppSidebarHeader>
          <AppSidebarTitle>PatientWise</AppSidebarTitle>
        </AppSidebarHeader>
        <ScrollArea className="flex-grow">
          <AppSidebarBody>
            {navContent(false)}
          </AppSidebarBody>
        </ScrollArea>
        <AppSidebarFooter>
          {/* Optional: Add footer content like user profile or settings link */}
        </AppSidebarFooter>
      </AppSidebar>

      {/* Mobile Sheet Trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[280px] p-0 flex flex-col">
            {/* Utiliser SheetHeader et SheetTitle de @/components/ui/sheet ici */}
            <SheetHeader className="p-4 border-b">
              <SheetTitle>PatientWise</SheetTitle>
              {/* Vous pouvez ajouter un SheetDescription ici si nécessaire */}
            </SheetHeader>
            <ScrollArea className="flex-grow">
              <div className="p-4"> {/* Ajout d'un padding pour le contenu du menu mobile */}
                {navContent(true)}
              </div>
            </ScrollArea>
            <SheetFooter className="p-4 border-t">
              {/* Contenu optionnel pour le pied de page du menu mobile */}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
