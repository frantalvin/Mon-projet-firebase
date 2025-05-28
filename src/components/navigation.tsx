
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Standard Next.js hook
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assurez-vous que ScrollArea est disponible
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
  // SidebarNavHeader,
  // SidebarNavHeaderTitle,
  SidebarNavLink,
  // SidebarSeparator,
} from '@/components/ui/sidebar';
import { LayoutDashboard, UsersRound, CalendarDays, Menu, LineChart, ShieldCheck } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/patients', label: 'Patients', icon: UsersRound },
    { href: '/appointments', label: 'Rendez-vous', icon: CalendarDays },
    { href: '/statistics', label: 'Statistiques', icon: LineChart },
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
  ];

  const isActive = (path: string) => {
    // Handle exact match for dashboard, and prefix match for others
    if (path === '/dashboard') return pathname === path;
    // For other routes, check if the pathname starts with the item's href.
    // This handles nested routes like /patients/[id] correctly.
    return pathname.startsWith(path);
  };

  const navContent = (isSheet = false) => (
    <>
      <SidebarNav>
        <SidebarNavMain>
          {navItems.map((item) =>
            isSheet ? (
              <SheetClose asChild key={item.href}>
                <SidebarNavLink
                  href={item.href}
                  active={isActive(item.href)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </SidebarNavLink>
              </SheetClose>
            ) : (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                active={isActive(item.href)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </SidebarNavLink>
            )
          )}
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
        <ScrollArea className="flex-grow"> {/* Added ScrollArea for desktop */}
          <SidebarBody>
           {navContent()}
          </SidebarBody>
        </ScrollArea>
        <SidebarFooter>
          {/* Optional: Add footer content like user profile or settings link */}
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sheet Trigger */}
      {/* The SheetTrigger logic needs to be outside the main content flow if it's fixed */}
      <div className="lg:hidden fixed top-3 left-3 z-50"> {/* Adjusted positioning */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0 flex flex-col"> {/* Ensure flex-col for SheetContent */}
            <Sidebar className="flex flex-col h-full"> {/* flex-col and h-full for Sidebar itself */}
              <SidebarHeader>
                <SidebarTitle>PatientWise</SidebarTitle>
              </SidebarHeader>
              <ScrollArea className="flex-grow"> {/* ScrollArea for mobile too */}
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
