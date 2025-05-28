'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Standard Next.js hook
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
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { LayoutDashboard, UsersRound, CalendarDays, Menu } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patients', label: 'Patients', icon: UsersRound },
    { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  ];

  const isActive = (path: string) => {
    // Handle exact match for dashboard, and prefix match for others
    if (path === '/dashboard') return pathname === path;
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
        <SidebarBody className="flex-grow">
         {navContent()}
        </SidebarBody>
        <SidebarFooter>
          {/* Optional: Add footer content like user profile or settings link */}
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sheet Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0">
          <Sidebar className="flex flex-col h-full">
            <SidebarHeader>
              <SidebarTitle>PatientWise</SidebarTitle>
            </SidebarHeader>
            <SidebarBody className="flex-grow">
              {navContent(true)}
            </SidebarBody>
             <SidebarFooter>
              {/* Optional: Add footer content like user profile or settings link */}
            </SidebarFooter>
          </Sidebar>
        </SheetContent>
      </Sheet>
    </>
  );
}
