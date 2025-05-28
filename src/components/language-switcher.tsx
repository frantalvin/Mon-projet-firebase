
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation"; // Corrected import for App Router
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState, useTransition } from "react";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (nextLocale: string) => {
    startTransition(() => {
      // The pathname includes the current locale, so we need to remove it
      // or handle it based on localePrefix strategy.
      // If localePrefix is 'as-needed' or 'always', the pathname might start with /<locale>
      const currentPathWithoutLocale = pathname.startsWith(`/${locale}`)
        ? pathname.substring(`/${locale}`.length) || '/'
        : pathname;
      
      router.replace(`/${nextLocale}${currentPathWithoutLocale}`);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending} aria-label={t('changeLanguage')}>
          <Languages className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale("en")} disabled={locale === "en" || isPending}>
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale("fr")} disabled={locale === "fr" || isPending}>
          {t("french")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
