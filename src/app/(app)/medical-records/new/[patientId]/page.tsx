// src/app/(app)/medical-records/new/[patientId]/page.tsx
'use client';

import { use } from 'react'; // Ensure 'use' is imported from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Props type for the page component
interface NewMedicalRecordPageProps {
  params: { patientId: string }; // Next.js passes params as a promise for client components
}

export default function TestNewMedicalRecordPage({ params: paramsProp }: NewMedicalRecordPageProps) {
  console.log('[TestNewMedicalRecordPage] Component rendering. Raw paramsProp:', paramsProp);

  // Unwrap the params promise using React.use
  // This is the recommended way to access params in Client Components when they might be promises.
  let patientId: string | undefined;
  let resolvedParamsError: string | null = null;

  try {
    const resolvedParams = use(paramsProp);
    console.log('[TestNewMedicalRecordPage] Resolved params:', resolvedParams);
    patientId = resolvedParams?.patientId;
  } catch (error) {
    console.error('[TestNewMedicalRecordPage] Error unwrapping params with React.use():', error);
    resolvedParamsError = error instanceof Error ? error.message : String(error);
  }
  
  console.log('[TestNewMedicalRecordPage] patientId after use(paramsProp):', patientId);

  if (resolvedParamsError) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Erreur lors de la récupération des paramètres</h1>
        <p className="text-muted-foreground mb-4">Impossible de charger les informations du patient : {resolvedParamsError}</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des patients
          </Link>
        </Button>
      </div>
    );
  }

  if (!patientId) {
    console.error('[TestNewMedicalRecordPage] patientId is missing or undefined.');
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">ID du Patient Manquant</h1>
        <p className="text-muted-foreground mb-4">L'identifiant du patient n'a pas été fourni à cette page.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des patients
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href={`/patients/${patientId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la Fiche Patient
        </Link>
      </Button>
      <h1 className="text-3xl font-semibold mb-6">
        Page Simplifiée - Nouveau Dossier Médical
      </h1>
      <p className="text-lg">
        Cette page est pour le patient avec l'ID : <strong>{patientId}</strong>
      </p>
      <p className="mt-4 text-muted-foreground">
        Si vous voyez cette page, le routage vers <code>/medical-records/new/[patientId]</code> fonctionne.
        Le formulaire complet pour la saisie du dossier médical a été temporairement retiré pour diagnostiquer l'erreur 404.
      </p>
    </div>
  );
}
