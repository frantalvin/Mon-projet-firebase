"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useLocale } from 'next-intl';

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [router, locale]);

  // It's good practice to return null or a loading indicator
  // as the redirect might take a moment.
  return null; 
}
