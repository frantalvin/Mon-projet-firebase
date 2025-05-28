"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UsersRound, CalendarDays } from "lucide-react";
import Link from "next-intl/link"; // Utiliser Link de next-intl
import { usePathname } from "next-intl/client"; // Utiliser usePathname de next-intl
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
        const label = t(item.labelKey as any); // any pour simplifier, idéalement typer les clés
        // isActive: vérifier si le pathname commence par le href de l'item.
        // Pour /dashboard, il sera actif si pathname est /fr/dashboard (ou /en/dashboard etc.)
        // Pour les autres, c'est similaire.
        // next-intl/link gère le préfixe de la locale.
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
