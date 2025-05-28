// This file is deprecated and its content moved to /src/app/(app)/dashboard/page.tsx
// Please delete this file.
// Note: src/app/(app)/patients/[id]/page.tsx and src/app/(app)/patients/new/page.tsx are still used.
import { notFound } from 'next/navigation';

export default function DeprecatedPatientsListPage() {
  notFound(); // This will ensure a 404 if this page is somehow still routed
  return null;
}
