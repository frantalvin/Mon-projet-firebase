"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UsersRound, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

export function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const locale = useLocale();

  const navItems = [
    { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    { href: "/patients", labelKey: "patients", icon: UsersRound },
    { href: "/appointments", labelKey: "appointments", icon: CalendarDays },
  ];

  // Remove locale prefix from pathname for comparison if present
  const cleanPathname = pathname.startsWith(`/${locale}`) ? pathname.substring(`/${locale}`.length) || '/' : pathname;

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const label = t(item.labelKey as any); // Type assertion for safety
        // Prepend locale to href for Link component
        const localizedHref = `/${locale}${item.href}`;
        return (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton
              asChild
              isActive={cleanPathname.startsWith(item.href)}
              tooltip={{ children: label }}
            >
              <Link href={localizedHref}>
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
