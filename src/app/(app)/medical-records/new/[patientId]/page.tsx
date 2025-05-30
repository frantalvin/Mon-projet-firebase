
// This file is now obsolete and can be deleted.
// The functionality for creating a new medical record has been moved
// into a tab within /src/app/(app)/dashboard/page.tsx (NewMedicalRecordTabContent).
// This change was made to simplify routing and avoid 404 errors with dynamic nested routes.

import { notFound } from 'next/navigation';

export default function ObsoleteNewMedicalRecordPage() {
  notFound(); // This will ensure a 404 if this page is somehow still routed
  return null;
}

    
