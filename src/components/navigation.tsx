
'use client';

import Link from 'next/link'; // Using standard Next.js Link for query param changes
import { usePathname, useSearchParams } from 'next/navigation';
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
  SidebarNavLink,
} from '@/components/ui/sidebar';
import { LayoutDashboard, UsersRound, CalendarDays, Menu, LineChart, ShieldCheck } from 'lucide-react';

interface NavItem {
  query: string;
  label: string;
  icon: React.ElementType;
}

export function Navigation() {
  const pathname = usePathname(); // Base path, e.g., /dashboard
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const navItems: NavItem[] = [
    { query: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { query: 'patients', label: 'Patients', icon: UsersRound },
    { query: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
    { query: 'statistics', label: 'Statistiques', icon: LineChart },
    { query: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  // Helper to construct the href for navigation links
  const getHref = (tabQuery: string) => {
    // Assuming the base path for the tabbed interface is /dashboard
    // If it could be other paths, this logic might need adjustment
    return `/dashboard?tab=${tabQuery}`;
  };

  const navContent = (isSheet = false) => (
    <>
      <SidebarNav>
        <SidebarNavMain>
          {navItems.map((item) => {
            const href = getHref(item.query);
            const isActive = activeTab === item.query;
            const NavLinkComponent = isSheet ? SheetClose : 'div'; // SheetClose needs to wrap Link for mobile

            return isSheet ? (
              <SheetClose asChild key={item.query}>
                <SidebarNavLink
                  href={href}
                  active={isActive}
                  asChild // Important for SheetClose to work with Link
                >
                  <Link href={href} className="flex items-center">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </SidebarNavLink>
              </SheetClose>
            ) : (
              <SidebarNavLink
                key={item.query}
                href={href}
                active={isActive}
                asChild
              >
                <Link href={href} className="flex items-center">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </SidebarNavLink>
            );
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
           {navContent()}
          </SidebarBody>
        </ScrollArea>
        <SidebarFooter>
          {/* Optional: Add footer content like user profile or settings link */}
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sheet Trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0 flex flex-col">
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

    