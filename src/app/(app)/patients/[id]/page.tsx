
// src/app/(app)/patients/[id]/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, FileText, Printer, Terminal, AlertTriangle, Loader2, Eye } from "lucide-react"; // Added Eye
import { use, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeEmergencyCase, type EmergencyCaseAnalysis } from "@/ai/flows/emergency-flow";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from "next/link"; // Added Link

interface PatientFirestoreData {
  id: string;
  lastName: string;
  firstName: string;
  dob: string; // Stored as yyyy-MM-dd string
  sexe?: string;
  adresse?: string;
  phone?: string;
  email?: string;
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
  createdAt?: Timestamp;
}


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
      printWindow?.document.write('<style>@media print { body { margin: 20px; font-family: sans-serif; color: #000; } .no-print { display: none; } h1, h2, h3, h4, p, li, strong { color: #000 !important; } }</style>');
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


export default function PatientDetailPage({ params: paramsProp }: { params: { id: string } }) {
  const resolvedParams = use(paramsProp);
  const patientId = resolvedParams.id;
  console.log('[PatientDetailPage] Component rendered. Initial patientId from resolvedParams:', patientId);

  const [patient, setPatient] = useState<PatientFirestoreData | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecordFirestoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAiAnalysisDialogOpen, setIsAiAnalysisDialogOpen] = useState(false);
  const [isAnalyzingPatientEmergency, setIsAnalyzingPatientEmergency] = useState(false);
  const [patientEmergencyAnalysis, setPatientEmergencyAnalysis] = useState<EmergencyCaseAnalysis | null>(null);
  const [patientEmergencyError, setPatientEmergencyError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PatientDetailPage] useEffect triggered. patientId:', patientId);
    if (!patientId) {
      console.warn('[PatientDetailPage] Patient ID is missing in useEffect.');
      setError("ID du patient non fourni.");
      setIsLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`[PatientDetailPage] Starting data fetch for patient ID: ${patientId}`);
      try {
        console.log(`[PatientDetailPage] Fetching patient data for ID: ${patientId}`);
        const patientDocRef = doc(db, "patients", patientId);
        const patientDocSnap = await getDoc(patientDocRef);

        if (patientDocSnap.exists()) {
          const fetchedPatientData = { id: patientDocSnap.id, ...patientDocSnap.data() } as PatientFirestoreData;
          console.log("[PatientDetailPage] Patient data fetched:", fetchedPatientData);
          setPatient(fetchedPatientData);
        } else {
          console.warn(`[PatientDetailPage] No patient found with ID: ${patientId}`);
          setError("Patient non trouvé.");
          setPatient(null);
        }

        console.log(`[PatientDetailPage] Fetching medical history for patient ID: ${patientId}`);
        const medicalHistoryQuery = query(
          collection(db, "dossiersMedicaux"), // Make sure this collection name is correct
          where("patientId", "==", patientId),
          orderBy("consultationDate", "desc")
        );
        const medicalHistorySnapshot = await getDocs(medicalHistoryQuery);
        const fetchedMedicalHistory: MedicalRecordFirestoreData[] = [];
        medicalHistorySnapshot.forEach((doc) => {
          fetchedMedicalHistory.push({ id: doc.id, ...doc.data() } as MedicalRecordFirestoreData);
        });
        console.log("[PatientDetailPage] Medical history fetched:", fetchedMedicalHistory);
        setMedicalHistory(fetchedMedicalHistory);

      } catch (err: any) {
        console.error("[PatientDetailPage] Error fetching patient data or medical history:", err);
        setError(`Erreur lors de la récupération des données du patient : ${err.message}. Assurez-vous que les règles de sécurité Firestore autorisent la lecture des collections 'patients' et 'dossiersMedicaux'.`);
      } finally {
        setIsLoading(false);
        console.log("[PatientDetailPage] Data fetching finished.");
      }
    };

    fetchPatientData();
  }, [patientId]);
  
  useEffect(() => {
    console.log('[PatientDetailPage] isAnalyzingPatientEmergency state changed to:', isAnalyzingPatientEmergency);
  }, [isAnalyzingPatientEmergency]);

  const handleOpenReportDialog = () => {
    console.log('[PatientDetailPage] "Formulaire de Santé" button clicked.');
    setIsReportDialogOpen(true);
  };
  
  const handleEmergencyAI = async () => {
    // TODO: This needs a clear source for symptoms. 
    // For now, it uses a placeholder. This should be linked to a specific medical record's symptoms or a dedicated input.
    const symptomsDescription = medicalHistory.length > 0 && medicalHistory[0]?.symptomes ? medicalHistory[0].symptomes : "Symptômes généraux du patient (pas de dossier récent spécifié)."; 
    
    if (!symptomsDescription || symptomsDescription.length < 10) {
      toast.error("Description des symptômes insuffisante pour une analyse IA.", {
        description: "Veuillez sélectionner un dossier médical avec des symptômes ou fournir une description plus détaillée."
      });
      setPatientEmergencyError("Description des symptômes insuffisante (min. 10 caractères).");
      setIsAiAnalysisDialogOpen(true);
      return;
    }

    console.log('[PatientDetailPage] handleEmergencyAI called with description:', symptomsDescription);
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
         if (error.message.toLowerCase().includes("not_found") && error.message.toLowerCase().includes("model")) {
          userFriendlyMessage = "Le modèle d'IA spécifié n'a pas été trouvé ou n'est pas accessible.\nConseils :\n1. Vérifiez que votre GOOGLE_API_KEY dans le fichier .env est correcte, active et autorisée à utiliser les modèles Gemini.\n2. Assurez-vous que l'API \"Generative Language\" ou \"Vertex AI\" est activée dans votre projet Google Cloud.\n3. Le modèle demandé (ex: 'gemini-pro') doit être disponible pour votre compte et région.";
        } else if (error.message.toLowerCase().includes("permission_denied")) {
            userFriendlyMessage = "Permission refusée par le service IA. Vérifiez que votre GOOGLE_API_KEY a les droits nécessaires.";
        } else if (error.message.toLowerCase().includes("invalid_argument") && error.message.toLowerCase().includes("api key not valid")) {
          userFriendlyMessage = "Clé API invalide. Veuillez vérifier votre GOOGLE_API_KEY dans le fichier .env.";
        } else if (error.message.toLowerCase().includes("invalid_argument") && error.message.toLowerCase().includes("must supply a `model`")) {
           userFriendlyMessage = "Argument invalide : Le modèle d'IA doit être spécifié pour l'appel. Vérifiez la configuration du flux Genkit.";
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
  
  const mockHealthReportData: HealthReportData | null = patient ? {
    patientInfo: {
      id: patient.id,
      nom: `${patient.firstName} ${patient.lastName}`,
      dateNaissance: patient.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : 'N/A',
      adresse: patient.adresse || "Non renseignée",
      telephone: patient.phone || "Non renseigné",
      email: patient.email || "Non renseigné",
    },
    doctorInfo: { 
      nom: "Dr. Alpha", // Placeholder
      specialite: "Médecine Générale", // Placeholder
    },
    // These details should ideally come from a selected medical record
    consultationDate: medicalHistory[0]?.consultationDate ? format(medicalHistory[0].consultationDate.toDate(), 'dd MMMM yyyy', { locale: fr }) : new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
    symptomes: medicalHistory[0]?.symptomes || "Non spécifiés (données exemples)",
    diagnostic: medicalHistory[0]?.diagnostic || "Non spécifié (données exemples)",
    traitement: medicalHistory[0]?.traitementPrescrit ? [{ medicament: medicalHistory[0].traitementPrescrit, posologie: "Selon prescription" }] : [{ medicament: "Paracétamol", posologie: "1g 3x/jour (données exemples)" }],
    conseils: "Reposez-vous bien, hydratez-vous (données exemples).", 
    prochainRendezVous: "Dans 7 jours si pas d'amélioration (données exemples).", 
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
      </Alert>
    );
  }
  
  if (!patient) {
     return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Patient Introuvable</AlertTitle>
        <UiAlertDescription>Aucun patient trouvé avec l'ID {patientId}. Veuillez vérifier l'ID ou retourner à la liste des patients.</UiAlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Fiche Patient : {patient.firstName} {patient.lastName}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleOpenReportDialog} variant="outline">
            <FileText className="mr-2 h-5 w-5" />
            Formulaire de Santé
          </Button>
          <Button 
            onClick={handleEmergencyAI} 
            variant="outline" 
            disabled={isAnalyzingPatientEmergency}
          >
            <BrainCircuit className="mr-2 h-5 w-5" />
            {isAnalyzingPatientEmergency ? "Analyse IA en cours..." : "Évaluer Urgence (IA)"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>ID :</strong> {patient.id}</p>
            <p><strong>Nom Complet :</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>Date de Naissance :</strong> {patient.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</p>
            {patient.sexe && <p><strong>Sexe :</strong> {patient.sexe}</p>}
            <p><strong>Adresse :</strong> {patient.adresse || "Non renseignée"}</p>
            <p><strong>Téléphone :</strong> {patient.phone || "Non renseigné"}</p>
            <p><strong>Email :</strong> {patient.email || "Non renseigné"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique Médical</CardTitle>
          <CardDescription>Liste des consultations et dossiers médicaux.</CardDescription>
        </CardHeader>
        <CardContent>
          {medicalHistory.length > 0 ? (
            <ul className="space-y-3">
              {medicalHistory.map((entry) => (
                <li key={entry.id} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">
                      Consultation du {format(entry.consultationDate.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                       <Link href={`/medical-records/${entry.id}`}>
                         <Eye className="mr-2 h-4 w-4" />
                         Voir Détails Dossier
                       </Link>
                    </Button>
                  </div>
                  {entry.motifConsultation && <p className="text-sm"><strong>Motif :</strong> {entry.motifConsultation}</p>}
                  {entry.diagnostic && <p className="text-sm"><strong>Diagnostic :</strong> {entry.diagnostic}</p>}
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
    </div>
  );
}
