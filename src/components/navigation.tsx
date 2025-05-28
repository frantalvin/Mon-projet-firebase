
'use client';

import Link from 'next/link'; // Standard Next.js Link
import { usePathname, useSearchParams } from 'next/navigation'; // Standard Next.js hooks
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Sidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarBody,
  SidebarFooter,
  SidebarNav,
  SidebarNavMain,
  SidebarNavLink, // This component already uses next/link
} from '@/components/ui/sidebar';
import { LayoutDashboard, UsersRound, CalendarDays, Menu, LineChart, ShieldCheck, BrainCircuit } from 'lucide-react';

interface NavItem {
  query: string;
  label: string;
  icon: React.ElementType;
}

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const navItems: NavItem[] = [
    { query: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { query: 'patients', label: 'Patients', icon: UsersRound },
    { query: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
    // { query: 'statistics', label: 'Statistiques', icon: LineChart }, // Removed as per previous request
    // { query: 'admin', label: 'Admin', icon: ShieldCheck }, // Removed as per previous request
  ];

  const getHref = (tabQuery: string) => {
    return `/dashboard?tab=${tabQuery}`;
  };

  const navContent = (isSheet = false) => (
    <>
      <SidebarNav>
        <SidebarNavMain>
          {navItems.map((item) => {
            const href = getHref(item.query);
            const isActive = activeTab === item.query;

            if (isSheet) { // Mobile Sheet
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
            } else { // Desktop Sidebar
              return (
                <SidebarNavLink // SidebarNavLink IS a Link component.
                  key={item.query}
                  href={href}
                  active={isActive}
                  // No asChild needed here, and no inner Link component.
                  // The className="flex items-center" is already part of SidebarNavLink's definition.
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </SidebarNavLink>
              );
            }
          })}
        </SidebarNavMain>
      </SidebarNav>
    </>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex lg:flex-col border-r">
        <SidebarHeader>
          <SidebarTitle>PatientWise</SidebarTitle>
        </SidebarHeader>
        <ScrollArea className="flex-grow">
          <SidebarBody>
           {navContent(false)}
          </SidebarBody>
        </ScrollArea>
        <SidebarFooter>
          {/* Optional: Add footer content like user profile or settings link */}
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sheet Trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50"> {/* Adjusted to match AppLayout header height consideration */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[280px] p-0 flex flex-col"> {/* Adjusted width to match desktop */}
            <Sidebar className="flex flex-col h-full">
              <SidebarHeader>
                <SidebarTitle>PatientWise</SidebarTitle>
              </SidebarHeader>
              <ScrollArea className="flex-grow">
                <SidebarBody>
                  {navContent(true)}
                </SidebarBody>
              </ScrollArea>
               <SidebarFooter>
                {/* Optional: Add footer content */}
              </SidebarFooter>
            </Sidebar>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
