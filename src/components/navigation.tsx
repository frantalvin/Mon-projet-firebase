"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UsersRound, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Hardcoded labels (originally from messages/en.json)
const navLabels = {
  dashboard: "Dashboard",
  patients: "Patients",
  appointments: "Appointments"
};

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    { href: "/patients", labelKey: "patients", icon: UsersRound },
    { href: "/appointments", labelKey: "appointments", icon: CalendarDays },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const label = navLabels[item.labelKey as keyof typeof navLabels] || item.labelKey;
        return (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={{ children: label }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
