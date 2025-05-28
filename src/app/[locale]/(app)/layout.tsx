"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Navigation } from "@/components/navigation";
// import { Button } from "@/components/ui/button"; // Commented out as not used
// import { Settings, LogOut } from "lucide-react"; // Commented out as not used
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
// import { LanguageSwitcher } from "@/components/language-switcher"; // Removed as only French is supported
import { useTranslations } from 'next-intl';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('AppLayout');

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <Navigation />
        </SidebarContent>
        <SidebarFooter className="mt-auto">
            {/* Placeholder for potential footer items like settings or logout */}
            {/* <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 p-2">
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{t('settings')}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 p-2">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">{t('logout')}</span>
            </Button> */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-2 sm:p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" /> {/* Hidden on desktop, shown on mobile to toggle sheet */}
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* <LanguageSwitcher /> // Removed as only French is supported */}
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
