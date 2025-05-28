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
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-2 sm:p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
