
// src/app/(app)/medical-records/[recordId]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Interface pour les données d'un dossier médical (à affiner selon votre structure exacte)
interface MedicalRecordData {
  id: string;
  patientId: string; // Pour référence, peut-être pour afficher le nom du patient
  consultationDate: Timestamp;
  motifConsultation?: string;
  diagnostic?: string;
  symptomes?: string;
  traitementPrescrit?: string; // Pourrait être un objet ou un tableau
  notesMedecin?: string;
  // Ajoutez d'autres champs pertinents ici: résultats d'examens, etc.
}

// Interface pour les informations du patient liées (simplifiée)
interface PatientInfo {
  firstName: string;
  lastName: string;
}

export default function MedicalRecordDetailPage({ params: paramsProp }: { params: { recordId: string } }) {
  const resolvedParams = use(paramsProp);
  const recordId = resolvedParams.recordId;

  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordData | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setError("ID du dossier médical non fourni.");
      setIsLoading(false);
      return;
    }

    const fetchMedicalRecord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Récupérer les détails du dossier médical
        const recordDocRef = doc(db, "dossiersMedicaux", recordId); // Assurez-vous que "dossiersMedicaux" est le nom correct de votre collection
        const recordDocSnap = await getDoc(recordDocRef);

        if (recordDocSnap.exists()) {
          const recordData = { id: recordDocSnap.id, ...recordDocSnap.data() } as MedicalRecordData;
          setMedicalRecord(recordData);

          // Optionnel: Récupérer les infos du patient lié si patientId est présent dans le dossier médical
          if (recordData.patientId) {
            const patientDocRef = doc(db, "patients", recordData.patientId);
            const patientDocSnap = await getDoc(patientDocRef);
            if (patientDocSnap.exists()) {
              setPatientInfo(patientDocSnap.data() as PatientInfo);
            }
          }
        } else {
          setError("Dossier médical non trouvé.");
        }
      } catch (err: any) {
        console.error("Error fetching medical record:", err);
        setError(`Erreur lors de la récupération du dossier médical : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [recordId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Chargement du dossier médical...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <UiAlertDescription>{error}</UiAlertDescription>
      </Alert>
    );
  }

  if (!medicalRecord) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Dossier Introuvable</AlertTitle>
        <UiAlertDescription>Aucun dossier médical trouvé avec l'ID {recordId}.</UiAlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          Détails du Dossier Médical
          {patientInfo && ` de ${patientInfo.firstName} ${patientInfo.lastName}`}
        </h1>
        <Button variant="outline" asChild>
          <Link href={medicalRecord.patientId ? `/patients/${medicalRecord.patientId}` : "/dashboard?tab=patients"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la Fiche Patient
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Consultation du {format(medicalRecord.consultationDate.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</CardTitle>
          {medicalRecord.patientId && patientInfo && (
            <CardDescription>Patient: {patientInfo.firstName} {patientInfo.lastName} (ID: {medicalRecord.patientId})</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {medicalRecord.motifConsultation && (
            <div>
              <h4 className="font-semibold text-base mb-1">Motif de la Consultation</h4>
              <p>{medicalRecord.motifConsultation}</p>
            </div>
          )}
          {medicalRecord.symptomes && (
            <div>
              <h4 className="font-semibold text-base mb-1">Symptômes Rapportés</h4>
              <p className="whitespace-pre-wrap">{medicalRecord.symptomes}</p>
            </div>
          )}
          {medicalRecord.diagnostic && (
            <div>
              <h4 className="font-semibold text-base mb-1">Diagnostic</h4>
              <p>{medicalRecord.diagnostic}</p>
            </div>
          )}
          {medicalRecord.traitementPrescrit && (
            <div>
              <h4 className="font-semibold text-base mb-1">Traitement Prescrit</h4>
              <p className="whitespace-pre-wrap">{medicalRecord.traitementPrescrit}</p>
            </div>
          )}
          {medicalRecord.notesMedecin && (
            <div>
              <h4 className="font-semibold text-base mb-1">Notes du Médecin</h4>
              <p className="whitespace-pre-wrap">{medicalRecord.notesMedecin}</p>
            </div>
          )}
          {/* Ajoutez ici d'autres sections pour afficher plus de détails si nécessaire */}
        </CardContent>
      </Card>
      {/* Possibilité d'ajouter des actions ici : Modifier le dossier, Exporter, etc. */}
    </div>
  );
}
