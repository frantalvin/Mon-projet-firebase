
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation'; // Standard Next.js imports
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader as UiSheetHeader, // Aliased import
  SheetTitle as UiSheetTitle,   // Aliased import
  SheetFooter as UiSheetFooter   // Aliased import
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
import { LayoutDashboard, UsersRound, CalendarDays, Menu, LineChart, ShieldCheck, FileText, PlusCircle } from 'lucide-react'; // Added FileText, PlusCircle

interface NavItem {
  query: string;
  label: string;
  icon: React.ElementType;
  href?: string; // Make href optional as it's constructed for dashboard tabs
}

export function Navigation() {
  const pathname = usePathname(); 
  const searchParams = useSearchParams(); 
  const activeTab = searchParams.get('tab') || 'dashboard';

  const navItems: NavItem[] = [
    { query: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { query: 'patients', label: 'Patients', icon: UsersRound },
    { query: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
    { query: 'new-medical-record', label: 'Nouv. Dossier', icon: PlusCircle }, // New Nav Item
    // { query: 'statistics', label: 'Statistiques', icon: LineChart }, 
    // { query: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  const getHref = (item: NavItem) => {
    if (item.href) return item.href; // For external links like /patients/new
    return `/dashboard?tab=${item.query}`; // For dashboard tabs
  };
  
  const isActiveLink = (item: NavItem) => {
    if (pathname.startsWith('/patients/new') && item.query === 'patients') {
        return true; // Keep 'Patients' tab active when on 'New Patient' page
    }
    if (pathname.startsWith('/patients/') && !pathname.includes('/new') && item.query === 'patients') {
        return true; // Keep 'Patients' tab active when on patient detail page
    }
     if (pathname.startsWith('/medical-records/new') && item.query === 'new-medical-record') {
        return true;
    }
    return activeTab === item.query && pathname === '/dashboard';
  };


  const navContent = (isSheet = false) => (
    <SidebarNav>
      <SidebarNavMain>
        {navItems.map((item) => {
          const href = getHref(item);
          const isActive = isActiveLink(item);

          const linkClasses = cn(
            'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          );

          if (isSheet) {
            return (
              <SheetClose asChild key={item.query}>
                <Link
                  href={href}
                  className={linkClasses}
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
                className={linkClasses} // Ensure classes are applied for desktop too
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
            <UiSheetHeader className="p-4 border-b">
              <UiSheetTitle>PatientWise</UiSheetTitle>
            </UiSheetHeader>
            <ScrollArea className="flex-grow">
              <div className="p-4">
                {navContent(true)}
              </div>
            </ScrollArea>
            <UiSheetFooter className="p-4 border-t">
              {/* Contenu optionnel pour le pied de page du menu mobile */}
            </UiSheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

    