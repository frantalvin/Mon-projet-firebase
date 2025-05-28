"use client";

import { useEffect } from 'react';
import { useRouter } from 'next-intl/navigation'; // CORRECTED: useRouter is from next-intl/navigation
import { useLocale } from 'next-intl';

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Redirect to /{locale}/dashboard
    router.replace(`/${locale}/dashboard`);
  }, [router, locale]);

  return null; 
}
