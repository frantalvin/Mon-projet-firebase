// src/app/(app)/patients/[id]/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { use } from 'react'; // Import the 'use' hook

export default function PatientDetailPage({ params: paramsProp }: { params: { id: string } }) {
  // Unwrap paramsProp using React.use() as suggested by the error message.
  // The 'use' hook can accept a Promise or a direct value.
  // If paramsProp is a Promise, 'use' will suspend until it resolves.
  // If paramsProp is already an object, 'use' will return it directly.
  const resolvedParams = use(paramsProp);
  const patientId = resolvedParams.id;

  // Données factices pour la démonstration
  const patientData = {
    id: patientId,
    nom: `Patient ${patientId}`,
    dateNaissance: "1985-07-15",
    adresse: "123 Rue de l'Exemple, Ville",
    telephone: "0123456789",
    email: `patient${patientId}@example.com`,
    symptomesActuels: "Fièvre légère, toux sèche depuis 2 jours.",
    resultatsMedicaux: "Prise de sang en attente. Radio pulmonaire normale.",
    historiqueMedical: [
      { date: "2022-05-10", motif: "Consultation annuelle", diagnostic: "Bon état général" },
      { date: "2021-11-20", motif: "Grippe saisonnière", diagnostic: "Traitement symptomatique" },
    ],
    prescriptions: [
      { medicament: "Paracétamol 1g", posologie: "1 comprimé 3 fois/jour si douleur/fièvre" },
    ],
    observations: "Patient coopératif, semble un peu anxieux."
  };

  const handleEmergencyAI = () => {
    // Logique pour déclencher l'IA d'urgence
    // Pourrait ouvrir un modal ou rediriger, pré-remplir des infos du patient
    alert(`Déclenchement de l'IA d'urgence pour le patient ${patientData.nom} avec symptômes : ${patientData.symptomesActuels}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Fiche Patient : {patientData.nom}</h1>
        <Button onClick={handleEmergencyAI} variant="destructive">
          <BrainCircuit className="mr-2 h-5 w-5" />
          Évaluer Urgence (IA)
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>ID :</strong> {patientData.id}</p>
            <p><strong>Date de Naissance :</strong> {patientData.dateNaissance}</p>
            <p><strong>Adresse :</strong> {patientData.adresse}</p>
            <p><strong>Téléphone :</strong> {patientData.telephone}</p>
            <p><strong>Email :</strong> {patientData.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État Actuel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Symptômes Actuels :</strong> {patientData.symptomesActuels}</p>
            <p><strong>Résultats Médicaux Récents :</strong> {patientData.resultatsMedicaux}</p>
            <p><strong>Observations :</strong> {patientData.observations}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique Médical</CardTitle>
        </CardHeader>
        <CardContent>
          {patientData.historiqueMedical.length > 0 ? (
            <ul className="space-y-3">
              {patientData.historiqueMedical.map((entry, index) => (
                <li key={index} className="p-3 border rounded-md bg-muted/30">
                  <p><strong>Date :</strong> {entry.date}</p>
                  <p><strong>Motif :</strong> {entry.motif}</p>
                  <p><strong>Diagnostic :</strong> {entry.diagnostic}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Aucun historique médical disponible.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
           {patientData.prescriptions.length > 0 ? (
            <ul className="space-y-2">
              {patientData.prescriptions.map((prescription, index) => (
                <li key={index} className="p-2 border rounded-md">
                  <p><strong>Médicament :</strong> {prescription.medicament}</p>
                  <p><strong>Posologie :</strong> {prescription.posologie}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Aucune prescription active.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
