
// src/app/(app)/patients/[id]/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, FileText, Printer } from "lucide-react";
import { use, useState } from 'react'; // Import the 'use' hook and useState
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HealthReportData {
  patientInfo: {
    id: string;
    nom: string;
    dateNaissance: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  };
  doctorInfo: {
    nom: string;
    specialite: string;
  };
  consultationDate: string;
  symptomes: string;
  diagnostic: string;
  traitement: {
    medicament: string;
    posologie: string;
  }[];
  conseils: string;
  prochainRendezVous?: string;
}

function HealthReportDialog({ reportData, open, onOpenChange }: { reportData: HealthReportData | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!reportData) return null;

  const handlePrint = () => {
    const printableContent = document.getElementById('health-report-content');
    if (printableContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write('<html><head><title>Formulaire de Santé</title>');
      // You might want to link your globals.css or a specific print stylesheet
      printWindow?.document.write('<link rel="stylesheet" href="/globals.css" type="text/css" media="print"/>'); // Adjust path if needed
      printWindow?.document.write('<style>@media print { body { margin: 20px; font-family: sans-serif; } .no-print { display: none; } }</style>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printableContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
      // Timeout to ensure content is loaded before printing
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 250);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Formulaire de Santé Patient</DialogTitle>
          <DialogDescription>
            Récapitulatif de la consultation et des informations de santé du patient.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
        <div id="health-report-content" className="space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du Patient</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>ID Patient:</strong> {reportData.patientInfo.id}</p>
              <p><strong>Nom:</strong> {reportData.patientInfo.nom}</p>
              <p><strong>Date de Naissance:</strong> {reportData.patientInfo.dateNaissance}</p>
              {reportData.patientInfo.adresse && <p><strong>Adresse:</strong> {reportData.patientInfo.adresse}</p>}
              {reportData.patientInfo.telephone && <p><strong>Téléphone:</strong> {reportData.patientInfo.telephone}</p>}
              {reportData.patientInfo.email && <p><strong>Email:</strong> {reportData.patientInfo.email}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails de la Consultation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Date de Consultation:</strong> {reportData.consultationDate}</p>
              <p><strong>Médecin:</strong> {reportData.doctorInfo.nom} ({reportData.doctorInfo.specialite})</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnostic et Traitement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Symptômes Rapportés:</strong> {reportData.symptomes}</p>
              <p><strong>Diagnostic (Maladie):</strong> {reportData.diagnostic}</p>
              <div className="pt-2">
                <h4 className="font-semibold">Traitement(s) Prescrit(s):</h4>
                {reportData.traitement.map((t, index) => (
                  <div key={index} className="pl-4">
                    <p><strong>Médicament:</strong> {t.medicament}</p>
                    <p><strong>Posologie:</strong> {t.posologie}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conseils et Suivi</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Conseils du Médecin:</strong> {reportData.conseils}</p>
              {reportData.prochainRendezVous && <p><strong>Prochain Rendez-vous:</strong> {reportData.prochainRendezVous}</p>}
            </CardContent>
          </Card>
        </div>
        </ScrollArea>
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function PatientDetailPage({ params: paramsProp }: { params: { id: string } }) {
  const resolvedParams = use(paramsProp);
  const patientId = resolvedParams.id;
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Données factices pour la démonstration - A remplacer par des données réelles de Firestore
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

  const mockHealthReportData: HealthReportData = {
    patientInfo: {
      id: patientData.id,
      nom: patientData.nom,
      dateNaissance: patientData.dateNaissance,
      adresse: patientData.adresse,
      telephone: patientData.telephone,
      email: patientData.email,
    },
    doctorInfo: {
      nom: "Dr. Alpha",
      specialite: "Médecine Générale",
    },
    consultationDate: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
    symptomes: patientData.symptomesActuels,
    diagnostic: "Grippe saisonnière (Exemple)",
    traitement: patientData.prescriptions.map(p => ({ medicament: p.medicament, posologie: p.posologie })),
    conseils: "Reposez-vous bien, hydratez-vous abondamment. Surveillez votre température.",
    prochainRendezVous: "Dans 7 jours si pas d'amélioration, ou avant si aggravation.",
  };


  const handleEmergencyAI = () => {
    alert(`Déclenchement de l'IA d'urgence pour le patient ${patientData.nom} avec symptômes : ${patientData.symptomesActuels}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Fiche Patient : {patientData.nom}</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsReportDialogOpen(true)} variant="outline">
            <FileText className="mr-2 h-5 w-5" />
            Formulaire de Santé
          </Button>
          <Button onClick={handleEmergencyAI} variant="destructive">
            <BrainCircuit className="mr-2 h-5 w-5" />
            Évaluer Urgence (IA)
          </Button>
        </div>
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
      
      <HealthReportDialog 
        reportData={mockHealthReportData}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </div>
  );
}
