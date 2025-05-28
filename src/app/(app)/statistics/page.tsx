// This file is deprecated and its content moved to /src/app/(app)/dashboard/page.tsx
// Please delete this file.
import { notFound } from 'next/navigation';

export default function DeprecatedStatisticsPage() {
  notFound(); // This will ensure a 404 if this page is somehow still routed
  return null;
}
