"use client";

import { useEffect } from 'react';
import { useRouter } from 'next-intl/client'; // Utiliser useRouter de next-intl
import { useLocale } from 'next-intl';

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Rediriger vers /{locale}/dashboard
    router.replace(`/${locale}/dashboard`);
  }, [router, locale]);

  return null; 
}
