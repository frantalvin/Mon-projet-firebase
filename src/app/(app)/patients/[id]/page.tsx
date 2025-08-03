
// src/app/(app)/patients/[id]/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, FileText, Printer, Terminal, AlertTriangle, Loader2, Eye, ArrowLeft, HeartPulse, Sparkles } from "lucide-react"; 
import { useState, useEffect, use } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeEmergencyCase, type EmergencyCaseAnalysis } from "@/ai/flows/emergency-flow";
import { summarizePatientHistory, type PatientSummaryOutput } from "@/ai/flows/summarize-patient-history-flow"; // Added
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea"; // Added for summary display
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from "next/link";

interface PatientFirestoreData {
  id: string;
  lastName: string;
  firstName: string;
  dob: string; 
  sexe?: string;
  adresse?: string;
  phone?: string;
  email?: string;
  service?: string; 
  createdAt?: Timestamp;
}

interface MedicalRecordFirestoreData {
  id: string;
  patientId: string;
  consultationDate: Timestamp;
  motifConsultation?: string;
  diagnostic?: string;
  symptomes?: string;
  traitementPrescrit?: string;
  notesMedecin?: string;
  issueConsultation?: string; 
  createdAt?: Timestamp;
  doctorName?: string;
  doctorSpecialty?: string;
}


interface HealthReportData {
  patientInfo: {
    id: string;
    nom: string;
    dateNaissance: string;
    service?: string; 
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
  issueConsultation?: string; 
}

function HealthReportDialog({ reportData, open, onOpenChange }: { reportData: HealthReportData | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!reportData) return null;

  const handlePrint = () => {
    const printableContent = document.getElementById('health-report-content');
    if (printableContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write('<html><head><title>Formulaire de Santé</title>');
      printWindow?.document.write('<style>body{font-family:sans-serif;margin:20px;}h1,h2,h3,h4{color:#333;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}.no-print{display:none;}</style>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printableContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
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
              {reportData.patientInfo.service && <p><strong>Service:</strong> {reportData.patientInfo.service}</p>}
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
              <CardTitle className="text-lg">Diagnostic, Traitement et Issue</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Symptômes Rapportés:</strong> {reportData.symptomes}</p>
              <p><strong>Diagnostic (Maladie):</strong> {reportData.diagnostic}</p>
              {reportData.issueConsultation && <p><strong>Issue de la consultation:</strong> {reportData.issueConsultation}</p>}
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

function AiAnalysisDialog({ analysis, error, open, onOpenChange, isLoading }: { analysis: EmergencyCaseAnalysis | null, error: string | null, open: boolean, onOpenChange: (open: boolean) => void, isLoading: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analyse IA de l'Urgence</DialogTitle>
          <DialogDescription>
            Résultat de l'analyse par l'intelligence artificielle.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {isLoading && <p className="text-muted-foreground text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Analyse en cours...</p>}
          {error && !isLoading && (
            <Alert variant="destructive" className="whitespace-pre-wrap">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur d'Analyse</AlertTitle>
              <UiAlertDescription>{error}</UiAlertDescription>
            </Alert>
          )}
          {analysis && !isLoading &&(
            <div className="p-4 border rounded-lg bg-muted/50 text-sm">
              <p><strong>Priorité :</strong> <span className={
                analysis.priority === "Élevée" ? "text-destructive font-bold" : 
                analysis.priority === "Moyenne" ? "text-yellow-600 font-bold" : 
                analysis.priority === "Faible" ? "text-green-600 font-bold" : "" 
              }>{analysis.priority}</span></p>
              <p><strong>Justification :</strong> {analysis.reasoning}</p>
              <div>
                <strong>Actions Recommandées :</strong>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {!analysis && !error && !isLoading && <p className="text-muted-foreground">Aucune analyse disponible ou aucune description fournie.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PatientSummaryDialog({ summary, error, open, onOpenChange, isLoading }: { summary: string | null, error: string | null, open: boolean, onOpenChange: (open: boolean) => void, isLoading: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Résumé IA de l'Historique Patient</DialogTitle>
          <DialogDescription>
            Synthèse de l'historique médical du patient générée par IA.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {isLoading && <p className="text-muted-foreground text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Génération du résumé en cours...</p>}
          {error && !isLoading && (
            <Alert variant="destructive" className="whitespace-pre-wrap">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Génération du Résumé</AlertTitle>
              <UiAlertDescription>{error}</UiAlertDescription>
            </Alert>
          )}
          {summary && !isLoading &&(
            <ScrollArea className="max-h-[50vh] p-1">
              <Textarea
                value={summary}
                readOnly
                className="w-full min-h-[200px] text-sm bg-muted/30"
                rows={10}
              />
            </ScrollArea>
          )}
          {!summary && !error && !isLoading && <p className="text-muted-foreground">Aucun résumé disponible.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Correspond à `consultationOutcomes` dans dashboard/page.tsx
const consultationOutcomeLabels: { [key: string]: string } = {
  "En cours": "En cours de traitement",
  "Guérison": "Guérison",
  "Amélioration": "Amélioration",
  "Stable": "Stable",
  "Évacuation": "Évacuation (Référé)",
  "Échec thérapeutique": "Échec thérapeutique",
  "Complications": "Complications",
  "Décès": "Décès",
  "Naissance": "Naissance",
  "Autre": "Autre",
};


export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { id: patientId } = params;

  const [patient, setPatient] = useState<PatientFirestoreData | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecordFirestoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAiAnalysisDialogOpen, setIsAiAnalysisDialogOpen] = useState(false);
  const [isAnalyzingPatientEmergency, setIsAnalyzingPatientEmergency] = useState(false);
  const [patientEmergencyAnalysis, setPatientEmergencyAnalysis] = useState<EmergencyCaseAnalysis | null>(null);
  const [patientEmergencyError, setPatientEmergencyError] = useState<string | null>(null);

  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [patientSummary, setPatientSummary] = useState<string | null>(null);
  const [patientSummaryError, setPatientSummaryError] = useState<string | null>(null);


  useEffect(() => {
    if (!patientId) {
      setError("ID du patient non fourni pour la récupération des données.");
      setIsLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const patientDocRef = doc(db, "patients", patientId);
        const patientDocSnap = await getDoc(patientDocRef);

        if (patientDocSnap.exists()) {
          const fetchedPatientData = { id: patientDocSnap.id, ...patientDocSnap.data() } as PatientFirestoreData;
          setPatient(fetchedPatientData);
        } else {
          setError("Patient non trouvé.");
          setPatient(null);
        }

        const medicalHistoryQuery = query(
          collection(db, "dossiersMedicaux"), 
          where("patientId", "==", patientId),
          orderBy("consultationDate", "desc")
        );
        const medicalHistorySnapshot = await getDocs(medicalHistoryQuery);
        const fetchedMedicalHistory: MedicalRecordFirestoreData[] = [];
        medicalHistorySnapshot.forEach((docSnap) => {
          fetchedMedicalHistory.push({ id: docSnap.id, ...docSnap.data() } as MedicalRecordFirestoreData);
        });
        setMedicalHistory(fetchedMedicalHistory);

      } catch (err: any) {
        console.error("[PatientDetailPage] Error fetching patient data or medical history:", err);
        let errorMessage = `Erreur lors de la récupération des données du patient : ${err.message || "Erreur inconnue."}.`;
        if (err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes("permission"))) {
            errorMessage += " Veuillez vérifier vos règles de sécurité Firestore et vous assurer que l'utilisateur authentifié a les droits de lecture.";
        } else if (err.message && err.message.includes("requires an index")) {
            errorMessage += " Une requête nécessite un index Firestore qui n'existe pas. Veuillez vérifier la console Firebase pour un lien de création d'index.";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]); 
  
  const handleOpenReportDialog = () => {
    if (!patient) {
        toast.error("Informations du patient non chargées.", { description: "Impossible de générer le formulaire sans données patient."});
        return;
    }
    setIsReportDialogOpen(true);
  };
  
  useEffect(() => {
    // This is for debugging purposes, can be removed in production
  }, [isAnalyzingPatientEmergency]);

  const handleEmergencyAI = async () => {
    const symptomsDescription = medicalHistory[0]?.symptomes || "Symptômes non spécifiés dans le dossier le plus récent ou pas d'historique.";
    
    if (!symptomsDescription || symptomsDescription.trim().length < 10) {
      toast.error("Description des symptômes insuffisante pour une analyse IA.", {
        description: "Veuillez vous assurer qu'il y a des symptômes enregistrés ou fournissez une description plus détaillée."
      });
      setPatientEmergencyError("Description des symptômes insuffisante (min. 10 caractères).");
      setPatientEmergencyAnalysis(null);
      setIsAiAnalysisDialogOpen(true);
      return;
    }

    setIsAnalyzingPatientEmergency(true);
    setPatientEmergencyAnalysis(null);
    setPatientEmergencyError(null);
    setIsAiAnalysisDialogOpen(true); 

    try {
      toast.info("Analyse IA de l'urgence en cours...");
      const result = await analyzeEmergencyCase({ description: symptomsDescription });
      setPatientEmergencyAnalysis(result);
      toast.success("Analyse IA terminée avec succès.");
    } catch (error: any) {
      console.error("[PatientDetailPage] Error analyzing patient emergency case:", error);
      let userFriendlyMessage = "Une erreur inconnue est survenue lors de l'analyse IA.";
      if (error instanceof Error || (error && typeof error.message === 'string')) {
         if (error.message.includes("NOT_FOUND") && error.message.includes("Model")) {
          userFriendlyMessage = `Le modèle d'IA spécifié (${(error.message.match(/Model '(.*)' not found/) || [])[1] || 'inconnu'}) n'a pas été trouvé ou n'est pas accessible.\nConseils :\n1. Vérifiez votre GOOGLE_API_KEY.\n2. Assurez-vous que l'API Generative Language ou Vertex AI est activée.`;
        } else if (error.message.includes("PERMISSION_DENIED") || error.message.includes("API key not valid")) {
            userFriendlyMessage = "Permission refusée par le service IA ou clé API invalide. Vérifiez votre GOOGLE_API_KEY.";
        } else if (error.message.includes("INVALID_ARGUMENT") && error.message.includes("Must supply a `model`")) {
           userFriendlyMessage = "Argument invalide : Le modèle d'IA doit être spécifié. Vérifiez la configuration Genkit.";
        } else {
          userFriendlyMessage = error.message;
        }
      }
      setPatientEmergencyError(`Erreur d'analyse IA : ${userFriendlyMessage}`);
      toast.error("Erreur lors de l'analyse IA.", { description: userFriendlyMessage });
    } finally {
      setIsAnalyzingPatientEmergency(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!patientId) {
      toast.error("ID du patient non disponible pour générer le résumé.");
      return;
    }
    setIsGeneratingSummary(true);
    setPatientSummary(null);
    setPatientSummaryError(null);
    setIsSummaryDialogOpen(true);

    try {
      toast.info("Génération du résumé IA en cours...");
      const result: PatientSummaryOutput = await summarizePatientHistory({ patientId });
      setPatientSummary(result.summary);
      toast.success("Résumé IA généré avec succès.");
    } catch (error: any) {
      console.error("[PatientDetailPage] Error generating patient summary:", error);
      let userFriendlyMessage = "Une erreur inconnue est survenue lors de la génération du résumé.";
       if (error instanceof Error || (error && typeof error.message === 'string')) {
        if (error.message.includes("NOT_FOUND") && error.message.includes("Model")) {
          userFriendlyMessage = `Le modèle d'IA (${(error.message.match(/Model '(.*)' not found/) || [])[1] || 'inconnu'}) n'est pas accessible.\nConseils:\n1. Vérifiez votre GOOGLE_API_KEY.\n2. Assurez-vous que l'API AI est activée.`;
        } else if (error.message.includes("PERMISSION_DENIED") || error.message.includes("API key not valid")) {
          userFriendlyMessage = "Permission refusée par le service IA ou clé API invalide.";
        } else {
          userFriendlyMessage = error.message;
        }
      }
      setPatientSummaryError(`Erreur de génération du résumé : ${userFriendlyMessage}`);
      toast.error("Erreur lors de la génération du résumé.", { description: userFriendlyMessage });
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const mockHealthReportData: HealthReportData | null = patient ? {
    patientInfo: {
      id: patient.id,
      nom: `${patient.firstName} ${patient.lastName}`,
      dateNaissance: patient.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : 'N/A',
      service: patient.service || "Non spécifié",
      adresse: patient.adresse || "Non renseignée",
      telephone: patient.phone || "Non renseigné",
      email: patient.email || "Non renseigné",
    },
    doctorInfo: { 
      nom: medicalHistory[0]?.doctorName || "Dr. Prénom Nom (Exemple)",
      specialite: medicalHistory[0]?.doctorSpecialty || "Médecine Générale (Exemple)",
    },
    consultationDate: medicalHistory[0]?.consultationDate ? format(medicalHistory[0].consultationDate.toDate(), 'dd MMMM yyyy HH:mm', { locale: fr }) : "Date non spécifiée",
    symptomes: medicalHistory[0]?.symptomes || "Non spécifiés (données exemples)",
    diagnostic: medicalHistory[0]?.diagnostic || "Non spécifié (données exemples)",
    traitement: medicalHistory[0]?.traitementPrescrit ? [{ medicament: medicalHistory[0].traitementPrescrit, posologie: "Selon prescription" }] : [{ medicament: "Paracétamol", posologie: "1g 3x/jour (données exemples)" }],
    conseils: medicalHistory[0]?.notesMedecin || "Reposez-vous bien, hydratez-vous (données exemples).", 
    prochainRendezVous: "Dans 7 jours si pas d'amélioration (données exemples).", 
    issueConsultation: medicalHistory[0]?.issueConsultation ? (consultationOutcomeLabels[medicalHistory[0].issueConsultation] || medicalHistory[0].issueConsultation) : "Non spécifiée",
  } : null;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Chargement des informations du patient...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <UiAlertDescription>{error}</UiAlertDescription>
         <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard?tab=patients"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des patients</Link>
        </Button>
      </Alert>
    );
  }
  
  if (!patient) { 
     return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Patient Introuvable</AlertTitle>
        <UiAlertDescription>Aucun patient trouvé avec l'ID {patientId || "inconnu"}. Veuillez vérifier l'ID ou retourner à la liste des patients.</UiAlertDescription>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard?tab=patients"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des patients</Link>
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Fiche Patient : {patient.firstName} {patient.lastName}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=patients"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>ID :</strong> {patient.id}</p>
            <p><strong>Nom Complet :</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Date de Naissance :</strong> {patient.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</p>
            {patient.sexe && <p><strong>Sexe :</strong> {patient.sexe}</p>}
            {patient.service && (
              <div className="flex items-center">
                <HeartPulse className="h-4 w-4 text-muted-foreground mr-2" />
                <p><strong>Service :</strong> {patient.service}</p>
              </div>
            )}
            <p><strong>Adresse :</strong> {patient.adresse || "Non renseignée"}</p>
            <p><strong>Téléphone :</strong> {patient.phone || "Non renseigné"}</p>
            <p><strong>Email :</strong> {patient.email || "Non renseigné"}</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row flex-wrap gap-2">
            <Button onClick={handleOpenReportDialog} variant="outline" className="w-full sm:w-auto" disabled={!patient}>
              <FileText className="mr-2 h-5 w-5" />
              Formulaire de Santé
            </Button>
            <Button 
              onClick={handleEmergencyAI} 
              variant="default"
              disabled={isAnalyzingPatientEmergency || !patient || medicalHistory.length === 0}
              className="w-full sm:w-auto"
            >
              <BrainCircuit className="mr-2 h-5 w-5" />
              {isAnalyzingPatientEmergency ? "Analyse Urgence..." : "Évaluer Urgence (IA)"}
            </Button>
            <Button
              onClick={handleGenerateSummary}
              variant="secondary"
              disabled={isGeneratingSummary || !patientId}
              className="w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isGeneratingSummary ? "Résumé IA en cours..." : "Générer Résumé IA"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique Médical</CardTitle>
          <CardDescription>Liste des consultations et dossiers médicaux du patient.</CardDescription>
        </CardHeader>
        <CardContent>
          {medicalHistory.length > 0 ? (
            <ul className="space-y-3">
              {medicalHistory.map((entry) => (
                <li key={entry.id} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">
                        Consultation du {entry.consultationDate ? format(entry.consultationDate.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'Date inconnue'}
                        </h4>
                        {entry.motifConsultation && <p className="text-sm"><strong>Motif :</strong> {entry.motifConsultation}</p>}
                        {entry.diagnostic && <p className="text-sm"><strong>Diagnostic :</strong> {entry.diagnostic}</p>}
                        {entry.issueConsultation && <p className="text-sm"><strong>Issue :</strong> {consultationOutcomeLabels[entry.issueConsultation] || entry.issueConsultation}</p>}
                    </div>
                    <Button variant="outline" size="sm" asChild disabled={!entry.id}>
                       <Link href={entry.id ? `/medical-records/${entry.id}` : '#'}>
                         <Eye className="mr-2 h-4 w-4" />
                         Voir Détails Dossier
                       </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucun historique médical disponible pour ce patient.</p>
          )}
        </CardContent>
      </Card>
      
      <HealthReportDialog 
        reportData={mockHealthReportData} 
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />

      <AiAnalysisDialog
        analysis={patientEmergencyAnalysis}
        error={patientEmergencyError}
        open={isAiAnalysisDialogOpen}
        onOpenChange={setIsAiAnalysisDialogOpen}
        isLoading={isAnalyzingPatientEmergency}
      />

      <PatientSummaryDialog
        summary={patientSummary}
        error={patientSummaryError}
        open={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        isLoading={isGeneratingSummary}
      />
    </div>
  );
}
