// THIS FILE SHOULD BE DELETED
// It is the old, non-localized version.
// The correct version is in src/app/[locale]/(app)/appointments/page.tsx
"use client";
import { notFound } from 'next/navigation';
import React from 'react';

export default function ObsoleteAppointmentsPage() {
  React.useEffect(() => {
    // notFound(); // Uncomment to force 404
  }, []);
  return (
    <div style={{ color: 'red', padding: '20px', border: '2px solid red', margin: '20px' }}>
      <h1>Cette page (Anciens Rendez-vous - <code>src/app/(app)/appointments/page.tsx</code>) est obsolète.</h1>
      <p>Veuillez la supprimer. Accédez à l'application via les routes localisées (ex: /fr/appointments).</p>
    </div>
  );
}
