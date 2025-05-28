"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UsersRound, CalendarDays } from "lucide-react";
import Link from "next-intl/navigation"; // CORRECTED: Link is from next-intl/navigation
import { usePathname } from "next-intl/navigation"; // CORRECTED: usePathname is from next-intl/navigation
import { useTranslations } from "next-intl";

export function Navigation() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const navItems = [
    { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    { href: "/patients", labelKey: "patients", icon: UsersRound },
    { href: "/appointments", labelKey: "appointments", icon: CalendarDays },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const label = t(item.labelKey as any);
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        
        return (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
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
