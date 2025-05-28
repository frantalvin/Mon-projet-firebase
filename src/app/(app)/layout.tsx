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
// import { Navigation } from "@/components/navigation"; // Commented out to prevent error
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const appTitle = "PatientWise"; // This will not be translated if this layout is hit

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          {/* <Navigation /> */} {/* Temporarily commented out */}
          <div>Navigation Placeholder: If you see this, the old layout is active.</div>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
            {/* Placeholder for potential footer items like settings or logout */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-2 sm:p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold">{appTitle}</h1>
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
