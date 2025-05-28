
'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useState, useEffect, Suspense } from "react";
import type { EmergencyCaseAnalysis } from "@/ai/flows/emergency-flow";
import { analyzeEmergencyCase } from "@/ai/flows/emergency-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BrainCircuit, Users, CalendarDays, LineChartIcon, Shield, PlusCircle, Eye } from "lucide-react"; // Added more icons
import Link from 'next/link';
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';


// Placeholder data for appointments chart
const weeklyAppointmentsData = [
  { day: "Lun", appointments: 4 },
  { day: "Mar", appointments: 3 },
  { day: "Mer", appointments: 5 },
  { day: "Jeu", appointments: 2 },
  { day: "Ven", appointments: 6 },
  { day: "Sam", appointments: 1 },
  { day: "Dim", appointments: 0 },
];

// --- Components for Tab Content ---

function DashboardTabContent() {
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [emergencyAnalysis, setEmergencyAnalysis] = useState<EmergencyCaseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activePatients, setActivePatients] = useState<number | null>(null);
  const [appointmentsToday, setAppointmentsToday] = useState<number | null>(null);

  useEffect(() => {
    // Placeholder data, replace with actual data fetching if needed
    setActivePatients(125); 
    setAppointmentsToday(8); 
  }, []);

  const handleAnalyzeEmergency = async () => {
    if (!emergencyDescription.trim()) {
      setAnalysisError("Veuillez décrire le cas d'urgence.");
      return;
    }
    setIsAnalyzing(true);
    setEmergencyAnalysis(null);
    setAnalysisError(null);
    try {
      const result = await analyzeEmergencyCase({ description: emergencyDescription });
      setEmergencyAnalysis(result);
    } catch (error: any) {
      console.error("Error analyzing emergency case:", error);
      const errorMessage = error.message || "Une erreur inconnue est survenue lors de l'analyse.";
      setAnalysisError(`Erreur d'analyse : ${errorMessage}`);
      setEmergencyAnalysis({
        priority: "Erreur",
        reasoning: `L'analyse a échoué: ${errorMessage}`,
        recommendedActions: ["Vérifier la console pour les détails techniques."]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-semibold">Tableau de Bord</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patients Actifs</CardTitle>
            <CardDescription>Nombre total de patients actifs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{activePatients !== null ? activePatients : "Chargement..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
            <CardDescription>Nombre de rendez-vous prévus aujourd'hui.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appointmentsToday !== null ? appointmentsToday : "Chargement..."}</p>
          </CardContent>
        </Card>
         <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild><Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" />Nouveau Patient</Link></Button>
            <Button variant="outline">Nouveau Rendez-vous</Button> {/* TODO: Implement this link/action */}
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Rendez-vous Hebdomadaires</CardTitle>
          <CardDescription>Aperçu des rendez-vous pour la semaine en cours.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAppointmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="hsl(var(--primary))" name="Rendez-vous" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priorisation des Urgences (IA)</CardTitle>
          <CardDescription>
            Décrivez un cas d'urgence pour obtenir une priorisation et des recommandations basées sur l'IA. (Min. 10 caractères)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency-description">Description du cas d'urgence</Label>
            <Textarea
              id="emergency-description"
              placeholder="Ex: Patient de 45 ans, douleur thoracique aiguë irradiant vers le bras gauche, essoufflement..."
              value={emergencyDescription}
              onChange={(e) => setEmergencyDescription(e.target.value)}
              rows={4}
              disabled={isAnalyzing}
            />
          </div>
          <Button onClick={handleAnalyzeEmergency} disabled={isAnalyzing || !emergencyDescription.trim() || emergencyDescription.length < 10}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyse en cours..." : "Analyser l'Urgence"}
          </Button>
          
          {analysisError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur d'Analyse</AlertTitle>
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          )}

          {emergencyAnalysis && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Résultat de l'Analyse IA :</h3>
              <p><strong>Priorité :</strong> <span className={
                emergencyAnalysis.priority === "Élevée" ? "text-destructive font-bold" : 
                emergencyAnalysis.priority === "Moyenne" ? "text-yellow-600 font-bold" : 
                emergencyAnalysis.priority === "Faible" ? "text-green-600 font-bold" : ""
              }>{emergencyAnalysis.priority}</span></p>
              <p><strong>Justification :</strong> {emergencyAnalysis.reasoning}</p>
              <div>
                <strong>Actions Recommandées :</strong>
                <ul className="list-disc list-inside space-y-1">
                  {emergencyAnalysis.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // Stored as yyyy-MM-dd string
  phone?: string;
  email?: string;
  createdAt?: any; // Firestore Timestamp or ServerTimestamp
}

function PatientsTabContent() {
  const [patientsList, setPatientsList] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const patientsCollectionRef = collection(db, "patients");
        // Optionally, order by creation date or last name
        const q = query(patientsCollectionRef, orderBy("createdAt", "desc")); 
        const querySnapshot = await getDocs(q);
        const fetchedPatients: PatientData[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPatients.push({ id: doc.id, ...doc.data() } as PatientData);
        });
        setPatientsList(fetchedPatients);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des patients :", error);
        setFetchError("Impossible de charger la liste des patients. " + (error.message || ""));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Gestion des Patients</h1>
        <Button asChild>
          <Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" />Nouveau Patient</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Patients</CardTitle>
          <CardDescription>Visualisez et gérez les dossiers patients.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-8 text-muted-foreground">Chargement des patients...</p>}
          {fetchError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Chargement</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !fetchError && patientsList.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Aucun patient enregistré.</p>
          )}
          {!isLoading && !fetchError && patientsList.length > 0 && (
            <ul className="space-y-3">
              {patientsList.map((patient) => (
                <li key={patient.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold">{patient.lastName}, {patient.firstName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Date de Naissance: {patient.dob ? format(new Date(patient.dob), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/patients/${patient.id}`}><Eye className="mr-2 h-4 w-4" />Voir Fiche</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentsTabContent() {
  // Placeholder data - replace with actual data fetching and management
  const appointments = [
    { id: '1', patient: 'Dupont, Jean', date: '2024-07-25 10:00', medecin: 'Dr. Alpha', statut: 'Prévu' },
    { id: '2', patient: 'Martin, Sophie', date: '2024-07-25 11:30', medecin: 'Dr. Bravo', statut: 'Terminé' },
    { id: '3', patient: 'Bernard, Paul', date: '2024-07-26 09:00', medecin: 'Dr. Alpha', statut: 'Annulé' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Gestion des Rendez-vous</h1>
        <Button><PlusCircle className="mr-2 h-4 w-4" />Nouveau Rendez-vous</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Rendez-vous</CardTitle>
          <CardDescription>Visualisez et gérez les rendez-vous planifiés.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Patient</th>
                    <th scope="col" className="px-6 py-3">Date et Heure</th>
                    <th scope="col" className="px-6 py-3">Médecin</th>
                    <th scope="col" className="px-6 py-3">Statut</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((rdv) => (
                    <tr key={rdv.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{rdv.patient}</td>
                      <td className="px-6 py-4">{rdv.date}</td>
                      <td className="px-6 py-4">{rdv.medecin}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rdv.statut === 'Prévu' ? 'bg-blue-100 text-primary' : // Primary for "Prévu"
                          rdv.statut === 'Terminé' ? 'bg-green-100 text-accent-foreground' : // Accent for "Terminé"
                          rdv.statut === 'Annulé' ? 'bg-red-100 text-destructive' : 'bg-gray-100 text-gray-800' // Destructive for "Annulé"
                        }`}>
                          {rdv.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm">Détails</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-8">Aucun rendez-vous.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatisticsTabContent() {
  const diseaseData = [
    { name: 'Grippe', count: 120 }, { name: 'Rhume', count: 90 },
    { name: 'Gastro', count: 75 }, { name: 'Angine', count: 60 },
    { name: 'Autre', count: 150 },
  ];
  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-semibold">Statistiques et Visualisations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Maladies les plus fréquentes</CardTitle>
          <CardDescription>Distribution des maladies diagnostiquées.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diseaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre de cas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminTabContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Gestion des Comptes</h1>
      <p className="mt-2">
        Cette section est réservée à l'administration des comptes utilisateurs (médecins, infirmiers, etc.).
      </p>
      <div className="mt-6 p-4 border rounded-lg bg-muted/30">
        <h2 className="font-semibold text-lg mb-2">Fonctionnalités prévues :</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Gérer les rôles (médecin, infirmier, admin)</li>
          <li>Activer/désactiver un compte</li>
          <li>Visualiser tous les utilisateurs</li>
        </ul>
        <p className="mt-4 text-sm text-destructive">
          Attention : Ces fonctionnalités sont en cours de développement et ne sont pas encore actives.
        </p>
      </div>
    </div>
  );
}

function MainAppPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const tabContents: { [key: string]: React.ReactNode } = {
    dashboard: <DashboardTabContent />,
    patients: <PatientsTabContent />,
    appointments: <AppointmentsTabContent />,
    statistics: <StatisticsTabContent />,
    admin: <AdminTabContent />,
  };
  
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue={currentTab} value={currentTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-5 mb-4 sticky top-0 bg-background z-10 shadow-sm">
          <TabsTrigger value="dashboard" asChild><Link href="/dashboard?tab=dashboard" className="flex-1 text-center"><BrainCircuit className="inline-block mr-2 h-4 w-4" />Tableau de Bord</Link></TabsTrigger>
          <TabsTrigger value="patients" asChild><Link href="/dashboard?tab=patients" className="flex-1 text-center"><Users className="inline-block mr-2 h-4 w-4" />Patients</Link></TabsTrigger>
          <TabsTrigger value="appointments" asChild><Link href="/dashboard?tab=appointments" className="flex-1 text-center"><CalendarDays className="inline-block mr-2 h-4 w-4" />Rendez-vous</Link></TabsTrigger>
          <TabsTrigger value="statistics" asChild><Link href="/dashboard?tab=statistics" className="flex-1 text-center"><LineChartIcon className="inline-block mr-2 h-4 w-4" />Statistiques</Link></TabsTrigger>
          <TabsTrigger value="admin" asChild><Link href="/dashboard?tab=admin" className="flex-1 text-center"><Shield className="inline-block mr-2 h-4 w-4" />Admin</Link></TabsTrigger>
        </TabsList>
        
        <div className="flex-grow overflow-y-auto p-1">
          <TabsContent value="dashboard" className={currentTab === 'dashboard' ? 'block' : 'hidden'}>
            {tabContents.dashboard}
          </TabsContent>
          <TabsContent value="patients" className={currentTab === 'patients' ? 'block' : 'hidden'}>
            {tabContents.patients}
          </TabsContent>
          <TabsContent value="appointments" className={currentTab === 'appointments' ? 'block' : 'hidden'}>
            {tabContents.appointments}
          </TabsContent>
          <TabsContent value="statistics" className={currentTab === 'statistics' ? 'block' : 'hidden'}>
            {tabContents.statistics}
          </TabsContent>
          <TabsContent value="admin" className={currentTab === 'admin' ? 'block' : 'hidden'}>
            {tabContents.admin}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><p>Chargement de l'application...</p></div>}>
      <MainAppPage />
    </Suspense>
  );
}
