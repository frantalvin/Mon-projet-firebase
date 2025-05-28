// THIS FILE AND THE ENTIRE src/app/(app) DIRECTORY SHOULD BE DELETED
// It is the old, non-localized version.
// The correct version is in src/app/[locale]/(app)/layout.tsx
"use client";

import { notFound } from 'next/navigation';
import React from "react";

export default function ObsoleteAppLayout({ children }: { children: React.ReactNode }) {
  // This layout should not be rendered if i18n is set up correctly.
  // If you see this, it means routing is still hitting the old non-localized layout.
  // Please ensure the src/app/(app) directory is deleted and all routes
  // are handled by src/app/[locale]/(app)/...

  React.useEffect(() => {
    //notFound(); // Uncomment this to force a 404 if this layout is hit.
               // For now, we'll show a clear message.
  }, []);

  return (
    <div>
      <h1 style={{ color: 'red', padding: '20px', border: '2px solid red', margin: '20px' }}>
        ERREUR DE ROUTAGE : ANCIEN LAYOUT ACTIF!
      </h1>
      <p style={{ padding: '20px', margin: '20px' }}>
        Ce layout (<code>src/app/(app)/layout.tsx</code>) est obsolète et ne devrait plus être utilisé.
        Veuillez vous assurer que le dossier <code>src/app/(app)</code> a été supprimé.
        Les pages de l'application doivent être servies via la structure <code>src/app/[locale]/(app)/...</code>.
      </p>
      <p style={{ padding: '20px', margin: '20px' }}>Contenu enfant (obsolète) :</p>
      <div>{children}</div>
    </div>
  );
}
