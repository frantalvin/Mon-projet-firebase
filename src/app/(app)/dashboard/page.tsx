
'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';
import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import type { EmergencyCaseAnalysis } from "@/ai/flows/emergency-flow";
import { analyzeEmergencyCase } from "@/ai/flows/emergency-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BrainCircuit, Users, CalendarDays, LineChartIcon, ShieldCheck, PlusCircle, Eye, Search, FileText, CalendarIcon as LucideCalendarIcon, Loader2, AlertTriangle, Users2, CreditCard, DollarSign, HeartPulse, Activity, Lock } from "lucide-react";
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, addDoc, serverTimestamp, where } from "firebase/firestore";
import { format, startOfDay, endOfDay, isSameDay, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';


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
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingDashboardStats(true);
      try {
        // Fetch active patients
        const patientsSnapshot = await getDocs(collection(db, "patients"));
        setActivePatients(patientsSnapshot.size);

        // Fetch appointments for today
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("dateTime", ">=", Timestamp.fromDate(todayStart)),
          where("dateTime", "<=", Timestamp.fromDate(todayEnd))
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        let countToday = 0;
        appointmentsSnapshot.forEach(doc => {
          const appointmentData = doc.data();
          // Double check with client-side date conversion if needed, though Firestore query should be accurate
          if (appointmentData.dateTime && isSameDay(appointmentData.dateTime.toDate(), new Date())) {
            countToday++;
          }
        });
        setAppointmentsToday(countToday);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally set error states for individual cards
      } finally {
        setIsLoadingDashboardStats(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAnalyzeEmergency = async () => {
    if (!emergencyDescription.trim() || emergencyDescription.length < 10) {
      setAnalysisError("Veuillez décrire le cas d'urgence (min. 10 caractères).");
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
      let userFriendlyMessage = "Une erreur inconnue est survenue lors de l'analyse.";
       if (error instanceof Error || (error && typeof error.message === 'string')) {
        if (error.message.includes("NOT_FOUND") && error.message.includes("Model")) {
          userFriendlyMessage = `Le modèle d'IA spécifié (${(error.message.match(/Model '(.*)' not found/) || [])[1] || 'gemini-pro'}) n'a pas été trouvé ou n'est pas accessible.\nConseils :\n1. Vérifiez que votre GOOGLE_API_KEY dans le fichier .env est correcte, active et autorisée à utiliser les modèles Gemini.\n2. Assurez-vous que l'API "Generative Language" ou "Vertex AI" est activée dans votre projet Google Cloud.\n3. Le modèle demandé doit être disponible pour votre compte et région.`;
        } else if (error.message.includes("PERMISSION_DENIED") || error.message.includes("API key not valid")) {
          userFriendlyMessage = "Permission refusée par le service IA ou clé API invalide. Vérifiez votre GOOGLE_API_KEY et ses droits.";
        } else if (error.message.includes("INVALID_ARGUMENT") && error.message.includes("Must supply a `model`")) {
           userFriendlyMessage = "Argument invalide : Le modèle d'IA doit être spécifié pour l'appel. Vérifiez la configuration du flux Genkit.";
        } else {
          userFriendlyMessage = error.message;
        }
      }
      setAnalysisError(`Erreur d'analyse : ${userFriendlyMessage}`);
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
            <CardDescription>Nombre total de patients enregistrés.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{isLoadingDashboardStats ? <Loader2 className="h-8 w-8 animate-spin" /> : activePatients !== null ? activePatients : "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
            <CardDescription>Nombre de rendez-vous prévus aujourd'hui.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{isLoadingDashboardStats ? <Loader2 className="h-8 w-8 animate-spin" /> : appointmentsToday !== null ? appointmentsToday : "N/A"}</p>
          </CardContent>
        </Card>
         <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild><Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" />Nouveau Patient</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard?tab=new-medical-record"><PlusCircle className="mr-2 h-4 w-4" />Nouv. Dossier Médical</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Rendez-vous Hebdomadaires</CardTitle>
          <CardDescription>Aperçu des rendez-vous pour la semaine en cours (données exemples).</CardDescription>
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
            <Alert variant="destructive" className="mt-4 whitespace-pre-wrap">
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
  dob: string; 
  phone?: string;
  email?: string;
  service?: string; 
  createdAt?: Timestamp; 
}

function PatientsTabContent() {
  const [patientsList, setPatientsList] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const patientsCollectionRef = collection(db, "patients");
      const q = query(patientsCollectionRef, orderBy("lastName", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedPatients: PatientData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPatients.push({ id: doc.id, ...doc.data() } as PatientData);
      });
      setPatientsList(fetchedPatients);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des patients :", error);
      let errorMessage = `Impossible de charger la liste des patients. ${error.message || "Erreur inconnue."}`;
       if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour la collection 'patients'.";
      } else if (error.message && error.message.toLowerCase().includes("index")) {
        errorMessage += " Un index Firestore est requis. Veuillez vérifier la console Firebase pour créer l'index suggéré pour la collection 'patients' (tri par lastName asc).";
      }
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

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
          <CardDescription>
            Visualisez et gérez les informations des patients enregistrés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-8 text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement des patients...</p>}
          {!isLoading && fetchError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Chargement</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !fetchError && patientsList.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun patient enregistré pour le moment.
            </p>
          )}
          {!isLoading && !fetchError && patientsList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Nom</th>
                    <th scope="col" className="px-6 py-3">Prénom</th>
                    <th scope="col" className="px-6 py-3">Date de Naissance</th>
                    <th scope="col" className="px-6 py-3">Service</th>
                    <th scope="col" className="px-6 py-3">Téléphone</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsList.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{patient.lastName}</td>
                      <td className="px-6 py-4">{patient.firstName}</td>
                      <td className="px-6 py-4">
                        {patient.dob ? format(new Date(patient.dob), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{patient.service || "N/A"}</td>
                      <td className="px-6 py-4">{patient.phone || "N/A"}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/patients/${patient.id}`}><Eye className="mr-2 h-4 w-4" />Détails</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


interface AppointmentData {
  id: string;
  patientName: string; 
  doctorName: string; 
  dateTime: Timestamp; 
  status: 'Prévu' | 'Terminé' | 'Annulé' | 'Absent' | string; 
  reason?: string;
  consultationFee?: number;
  paymentStatus?: 'Impayé' | 'Payé';
}

const appointmentFormSchema = z.object({
  patientId: z.string({ required_error: "Veuillez sélectionner un patient." }),
  doctorName: z.string().min(2, { message: "Le nom du médecin doit contenir au moins 2 caractères." }),
  appointmentDate: z.date({ required_error: "La date du rendez-vous est requise." }),
  appointmentHour: z.string().regex(/^([01]\d|2[0-3])$/, { message: "Heure invalide (00-23)." }),
  appointmentMinute: z.string().regex(/^[0-5]\d$/, { message: "Minute invalide (00-59)." }),
  reason: z.string().min(5, { message: "Le motif doit contenir au moins 5 caractères." }).optional().or(z.literal('')),
  consultationFee: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: "Les frais doivent être un nombre." }).positive({ message: "Les frais doivent être un nombre positif." }).optional()
  ),
});
type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;


function AppointmentsTabContent() {
  const [appointmentsList, setAppointmentsList] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [patientsForSelect, setPatientsForSelect] = useState<PatientData[]>([]);
  const [isLoadingPatientsForSelect, setIsLoadingPatientsForSelect] = useState(true);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  const appointmentForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: undefined,
      doctorName: "",
      appointmentDate: new Date(),
      appointmentHour: "09",
      appointmentMinute: "00",
      reason: "",
      consultationFee: undefined,
    },
  });

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    console.log("[AppointmentsTabContent] Démarrage de la récupération des rendez-vous.");
    try {
      const appointmentsCollectionRef = collection(db, "appointments");
      const q = query(appointmentsCollectionRef, orderBy("dateTime", "desc"));
      const querySnapshot = await getDocs(q);
      console.log(`[AppointmentsTabContent] Snapshot des rendez-vous reçu. Nombre de documents: ${querySnapshot.size}`);
      
      const fetchedAppointments: AppointmentData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAppointments.push({
          id: doc.id,
          patientName: data.patientName || "N/A",
          doctorName: data.doctorName || "N/A",
          dateTime: data.dateTime,
          status: data.status || "Inconnu",
          reason: data.reason,
          consultationFee: data.consultationFee,
          paymentStatus: data.paymentStatus
        } as AppointmentData);
      });
      setAppointmentsList(fetchedAppointments);
      console.log("[AppointmentsTabContent] Rendez-vous récupérés et formatés:", fetchedAppointments);
    } catch (error: any) {
      console.error("[AppointmentsTabContent] Erreur lors de la récupération des rendez-vous :", error);
      let errorMessage = `Impossible de charger la liste des rendez-vous. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour la collection 'appointments'.";
      }
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
       console.log("[AppointmentsTabContent] Fin de la récupération des rendez-vous.");
    }
  }, []); 

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const fetchPatientsForSelect = async () => {
      if (!isAddAppointmentDialogOpen) return; 
      setIsLoadingPatientsForSelect(true);
      try {
        const patientsCollectionRef = collection(db, "patients");
        const q = query(patientsCollectionRef, orderBy("lastName", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedPatients: PatientData[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPatients.push({ id: doc.id, ...doc.data() } as PatientData);
        });
        setPatientsForSelect(fetchedPatients);
      } catch (error: any) {
        console.error("Error fetching patients for select:", error);
        toast.error("Erreur lors du chargement de la liste des patients pour le formulaire.");
      } finally {
        setIsLoadingPatientsForSelect(false);
      }
    };
    fetchPatientsForSelect();
  }, [isAddAppointmentDialogOpen]);

  async function onSubmitNewAppointment(data: AppointmentFormValues) {
    setIsSubmittingAppointment(true);
    const selectedPatient = patientsForSelect.find(p => p.id === data.patientId);
    if (!selectedPatient) {
      toast.error("Patient sélectionné introuvable.");
      setIsSubmittingAppointment(false);
      return;
    }

    try {
      const appointmentDateTime = new Date(data.appointmentDate);
      appointmentDateTime.setHours(parseInt(data.appointmentHour, 10));
      appointmentDateTime.setMinutes(parseInt(data.appointmentMinute, 10));
      appointmentDateTime.setSeconds(0);
      appointmentDateTime.setMilliseconds(0);

      const newAppointment: any = {
        patientId: data.patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorName: data.doctorName,
        dateTime: Timestamp.fromDate(appointmentDateTime),
        reason: data.reason || "",
        status: "Prévu", 
        paymentStatus: "Impayé",
        createdAt: serverTimestamp(),
      };
      if (data.consultationFee !== undefined && data.consultationFee > 0) {
        newAppointment.consultationFee = data.consultationFee;
      }


      await addDoc(collection(db, "appointments"), newAppointment);
      toast.success("Rendez-vous planifié avec succès !");
      appointmentForm.reset();
      setIsAddAppointmentDialogOpen(false);
      fetchAppointments(); 
    } catch (error: any) {
      console.error("Erreur lors de la planification du rendez-vous :", error);
      toast.error("Erreur lors de la planification du rendez-vous.", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue."
      });
    } finally {
      setIsSubmittingAppointment(false);
    }
  }

  const getStatusClassForList = (status: string) => {
    if (status === 'Terminé') return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
    if (status === 'Annulé') return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
    if (status === 'Prévu') return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
    if (status === 'Absent') return 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'; // Default/Unknown
  };
  
  const getPaymentStatusClass = (status?: 'Impayé' | 'Payé') => {
    if (status === 'Payé') return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
    return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'; // Impayé or undefined
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Gestion des Rendez-vous</h1>
        <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddAppointmentDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />Planifier un Rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Planifier un Nouveau Rendez-vous</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour créer un nouveau rendez-vous.
              </DialogDescription>
            </DialogHeader>
            <Form {...appointmentForm}>
              <form onSubmit={appointmentForm.handleSubmit(onSubmitNewAppointment)} className="space-y-4 py-4">
                <FormField
                  control={appointmentForm.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPatientsForSelect}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingPatientsForSelect ? "Chargement..." : "Sélectionner un patient"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingPatientsForSelect ? (
                            <SelectItem value="loading" disabled>Chargement des patients...</SelectItem>
                          ) : patientsForSelect.length === 0 ? (
                             <SelectItem value="no-patients" disabled>Aucun patient. Enregistrez-en un.</SelectItem>
                          ) : (
                            patientsForSelect.map(patient => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.lastName}, {patient.firstName} (Né le: {patient.dob ? format(new Date(patient.dob), 'dd/MM/yyyy', { locale: fr }) : 'N/A'})
                                {patient.service && ` - ${patient.service}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={appointmentForm.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du Médecin</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Dupont" {...field} disabled={isSubmittingAppointment} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={appointmentForm.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date du Rendez-vous</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmittingAppointment}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <LucideCalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isSubmittingAppointment} 
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={appointmentForm.control}
                        name="appointmentHour"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Heure (HH)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="09" {...field} disabled={isSubmittingAppointment} min="0" max="23" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={appointmentForm.control}
                        name="appointmentMinute"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minute (MM)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="30" {...field} disabled={isSubmittingAppointment} min="0" max="59" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                  control={appointmentForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de la consultation (Optionnel)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Consultation de suivi, symptômes grippaux..." {...field} disabled={isSubmittingAppointment} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={appointmentForm.control}
                  name="consultationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frais de consultation (Optionnel)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} disabled={isSubmittingAppointment} step="0.01" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline" disabled={isSubmittingAppointment}>Annuler</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmittingAppointment}>
                    {isSubmittingAppointment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmittingAppointment ? "Planification..." : "Planifier"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Rendez-vous</CardTitle>
          <CardDescription>Visualisez et gérez les rendez-vous planifiés.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-8 text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement des rendez-vous...</p>}

          {!isLoading && fetchError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Chargement</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !fetchError && appointmentsList.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun rendez-vous planifié pour le moment.
            </p>
          )}

          {!isLoading && !fetchError && appointmentsList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Patient</th>
                    <th scope="col" className="px-6 py-3">Date et Heure</th>
                    <th scope="col" className="px-6 py-3">Médecin</th>
                    <th scope="col" className="px-6 py-3">Statut RDV</th>
                    <th scope="col" className="px-6 py-3">Frais (€)</th>
                    <th scope="col" className="px-6 py-3">Paiement</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsList.map((rdv) => (
                    <tr key={rdv.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{rdv.patientName}</td>
                      <td className="px-6 py-4">
                        {rdv.dateTime ? format(rdv.dateTime.toDate(), 'dd MMMM yyyy HH:mm', { locale: fr }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{rdv.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassForList(rdv.status)}`}>
                          {rdv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{typeof rdv.consultationFee === 'number' ? rdv.consultationFee.toFixed(2) : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(rdv.paymentStatus)}`}>
                          {rdv.paymentStatus || 'Impayé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/appointments/${rdv.id}`}><Eye className="mr-2 h-4 w-4" />Détails</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const consultationOutcomes = [
  { value: "En cours", label: "En cours de traitement" },
  { value: "Guérison", label: "Guérison" },
  { value: "Amélioration", label: "Amélioration" },
  { value: "Stable", label: "Stable" },
  { value: "Évacuation", label: "Évacuation (Référé)" },
  { value: "Échec thérapeutique", label: "Échec thérapeutique" },
  { value: "Complications", label: "Complications" },
  { value: "Décès", label: "Décès" },
  { value: "Naissance", label: "Naissance" },
  { value: "Autre", label: "Autre (préciser dans notes)" },
];

const medicalRecordFormSchema = z.object({
  consultationDate: z.date({
    required_error: "La date de consultation est requise.",
  }),
  motifConsultation: z.string().min(5, { message: "Le motif doit contenir au moins 5 caractères." }).optional().or(z.literal('')),
  symptomes: z.string().min(5, { message: "Les symptômes doivent contenir au moins 5 caractères." }).optional().or(z.literal('')),
  diagnostic: z.string().min(3, { message: "Le diagnostic doit contenir au moins 3 caractères." }).optional().or(z.literal('')),
  traitementPrescrit: z.string().optional(),
  notesMedecin: z.string().optional(),
  issueConsultation: z.string({ required_error: "Veuillez sélectionner l'issue de la consultation." }),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

function NewMedicalRecordTabContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientsForSelect, setPatientsForSelect] = useState<PatientData[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [formKey, setFormKey] = useState(Date.now()); 

  useEffect(() => {
    const fetchPatientsForSelect = async () => {
      setIsLoadingPatients(true);
      try {
        const patientsCollectionRef = collection(db, "patients");
        const q = query(patientsCollectionRef, orderBy("lastName", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedPatients: PatientData[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPatients.push({ id: doc.id, ...doc.data() } as PatientData);
        });
        setPatientsForSelect(fetchedPatients);
      } catch (error: any) {
        console.error("Error fetching patients for select:", error);
        if (error.message && error.message.includes("requires an index")) {
            toast.error("Erreur de chargement des patients : Index Firestore manquant.", {
                description: "Un index est requis pour trier les patients. Veuillez créer l'index composite suggéré dans la console Firebase pour 'patients' (tri par lastName).",
                duration: 10000,
            });
        } else {
            toast.error("Erreur lors du chargement des patients.");
        }
      } finally {
        setIsLoadingPatients(false);
      }
    };
    fetchPatientsForSelect();
  }, []);

  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      consultationDate: new Date(),
      motifConsultation: "",
      symptomes: "",
      diagnostic: "",
      traitementPrescrit: "",
      notesMedecin: "",
      issueConsultation: undefined,
    },
  });

  useEffect(() => {
    form.reset({
        consultationDate: new Date(),
        motifConsultation: "",
        symptomes: "",
        diagnostic: "",
        traitementPrescrit: "",
        notesMedecin: "",
        issueConsultation: undefined,
    });
  }, [selectedPatientId, formKey, form]);


  async function onSubmit(data: MedicalRecordFormValues) {
    if (!selectedPatientId) {
      toast.error("Veuillez sélectionner un patient.");
      return;
    }
    const selectedPatient = patientsForSelect.find(p => p.id === selectedPatientId);
    if (!selectedPatient) {
        toast.error("Patient sélectionné introuvable.");
        return;
    }

    setIsSubmitting(true);
    try {
      const medicalRecordData = {
        ...data,
        patientId: selectedPatientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`, 
        consultationDate: Timestamp.fromDate(data.consultationDate),
        createdAt: serverTimestamp(),
      };

      console.log('[NewMedicalRecordTabContent] Submitting medical record data:', medicalRecordData);
      const docRef = await addDoc(collection(db, "dossiersMedicaux"), medicalRecordData);
      toast.success("Dossier médical enregistré avec succès!", {
        description: `Nouveau dossier créé pour ${selectedPatient.firstName} ${selectedPatient.lastName} (ID: ${docRef.id})`,
      });
      form.reset();
      setSelectedPatientId(undefined); 
      setFormKey(Date.now()); 
      router.push(`/patients/${selectedPatientId}`); 
    } catch (error: any) {
      console.error("[NewMedicalRecordTabContent] Erreur lors de l'enregistrement du dossier médical :", error);
      toast.error("Erreur lors de l'enregistrement du dossier.", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const patientNameForTitle = patientsForSelect.find(p => p.id === selectedPatientId);
  const pageTitle = selectedPatientId && patientNameForTitle ? 
    `Nouvelle Consultation pour : ${patientNameForTitle.firstName} ${patientNameForTitle.lastName}` : 
    "Nouvelle Consultation / Entrée au Dossier Médical";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{pageTitle}</h1>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Saisir les informations de la consultation</CardTitle>
          {!selectedPatientId && (
            <CardDescription>
              Veuillez d'abord sélectionner un patient. Si la liste est vide ou si le patient est nouveau, vous devez d'abord l'enregistrer via l'onglet "Patients" puis "Nouveau Patient".
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient-select">Sélectionner un Patient</Label>
            <Select
              value={selectedPatientId}
              onValueChange={(value) => {
                setSelectedPatientId(value);
                setFormKey(Date.now()); 
              }}
              disabled={isLoadingPatients}
            >
              <SelectTrigger id="patient-select" className="w-full md:w-[300px]">
                <SelectValue placeholder={isLoadingPatients ? "Chargement des patients..." : "Choisir un patient"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPatients ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : patientsForSelect.length === 0 ? (
                  <SelectItem value="no-patients" disabled>Aucun patient trouvé. Enregistrez-en un d'abord.</SelectItem>
                ) : (
                  patientsForSelect.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.lastName}, {patient.firstName} (Né le: {patient.dob ? format(new Date(patient.dob), 'dd/MM/yyyy', { locale: fr }) : 'N/A'})
                      {patient.service && ` - ${patient.service}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
             {!isLoadingPatients && patientsForSelect.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                    La liste des patients est vide. Vous devez d'abord <Link href="/patients/new" className="underline">enregistrer un nouveau patient</Link> avant de pouvoir créer un dossier médical.
                </p>
            )}
          </div>

          {selectedPatientId && (
            <Form {...form} key={formKey}> 
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="consultationDate"
                  key="consultationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de la Consultation</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <LucideCalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motifConsultation"
                  key="motifConsultation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de la Consultation</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Suivi annuel, Douleurs abdominales..." {...field} disabled={isSubmitting} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptomes"
                  key="symptomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptômes Rapportés</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Fièvre, Toux persistante, Fatigue..." {...field} disabled={isSubmitting} rows={4}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnostic"
                  key="diagnostic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostic</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Grippe saisonnière, Gastrite..." {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="traitementPrescrit"
                  key="traitementPrescrit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Traitement Prescrit</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Paracétamol 1g 3x/jour pendant 5 jours, Repos..." {...field} disabled={isSubmitting} rows={4}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notesMedecin"
                  key="notesMedecin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes du Médecin</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notes additionnelles, observations..." {...field} disabled={isSubmitting} rows={3}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="issueConsultation"
                  key="issueConsultation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue de la Consultation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'issue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {consultationOutcomes.map(outcome => (
                            <SelectItem key={outcome.value} value={outcome.value}>
                              {outcome.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !selectedPatientId}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                  ) : (
                    "Enregistrer la Consultation"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StaffData {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
  email?: string;
  phone?: string;
  createdAt?: Timestamp;
}

const staffFormSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom de famille doit contenir au moins 2 caractères." }),
  role: z.string().min(3, { message: "Le rôle doit contenir au moins 3 caractères (ex: Médecin, Infirmier)." }),
  specialty: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: "Adresse e-mail invalide." }).optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, { message: "Numéro de téléphone invalide."}).optional().or(z.literal('')),
});
type StaffFormValues = z.infer<typeof staffFormSchema>;

function StaffTabContent() {
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      specialty: "",
      email: "",
      phone: "",
    },
  });

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const staffCollectionRef = collection(db, "staff");
      const q = query(staffCollectionRef, orderBy("lastName", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedStaff: StaffData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedStaff.push({ id: doc.id, ...doc.data() } as StaffData);
      });
      setStaffList(fetchedStaff);
    } catch (error: any) {
      console.error("Erreur lors de la récupération du personnel :", error);
      let errorMessage = `Impossible de charger la liste du personnel. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes("permission"))) {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour la collection 'staff'.";
      }  else if (error.message && error.message.toLowerCase().includes("index")) {
        errorMessage += " Un index Firestore est requis. Veuillez vérifier la console Firebase pour créer l'index suggéré pour la collection 'staff' (tri par lastName asc).";
      }
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  async function onSubmitNewStaff(data: StaffFormValues) {
    setIsSubmittingStaff(true);
    try {
      const newStaffMember = {
        ...data,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "staff"), newStaffMember);
      toast.success("Membre du personnel ajouté avec succès !");
      staffForm.reset();
      setIsAddStaffDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du membre du personnel :", error);
      toast.error("Erreur lors de l'ajout du membre du personnel.", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue."
      });
    } finally {
      setIsSubmittingStaff(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Gestion du Personnel Soignant</h1>
        <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddStaffDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />Ajouter un Membre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un Nouveau Membre du Personnel</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <Form {...staffForm}>
              <form onSubmit={staffForm.handleSubmit(onSubmitNewStaff)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Alice" {...field} disabled={isSubmittingStaff} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Martin" {...field} disabled={isSubmittingStaff} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={staffForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Médecin, Infirmier(ère), Secrétaire" {...field} disabled={isSubmittingStaff} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={staffForm.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécialité (si applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cardiologie, Pédiatrie" {...field} disabled={isSubmittingStaff} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={staffForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optionnel)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="alice.martin@example.com" {...field} disabled={isSubmittingStaff} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={staffForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone (Optionnel)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+33 1 23 45 67 89" {...field} disabled={isSubmittingStaff} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmittingStaff}>Annuler</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmittingStaff}>
                    {isSubmittingStaff && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmittingStaff ? "Ajout en cours..." : "Ajouter le Membre"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste du Personnel</CardTitle>
          <CardDescription>Membres du personnel enregistrés.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-8 text-muted-foreground flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement du personnel...</p>}
          {!isLoading && fetchError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Chargement</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !fetchError && staffList.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun membre du personnel enregistré pour le moment.
            </p>
          )}
          {!isLoading && !fetchError && staffList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Nom</th>
                    <th scope="col" className="px-6 py-3">Rôle</th>
                    <th scope="col" className="px-6 py-3">Spécialité</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Téléphone</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{staff.lastName}, {staff.firstName}</td>
                      <td className="px-6 py-4">{staff.role}</td>
                      <td className="px-6 py-4">{staff.specialty || "N/A"}</td>
                      <td className="px-6 py-4">{staff.email || "N/A"}</td>
                      <td className="px-6 py-4">{staff.phone || "N/A"}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/staff/${staff.id}`}><Eye className="mr-2 h-4 w-4" />Détails</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DiseaseData {
  name: string;
  count: number;
}

interface AgeGroupStat {
  ageGroup: string;
  count: number;
}

interface ServiceStat {
  service: string;
  count: number;
}

interface AppointmentStatusStat {
  status: string;
  count: number;
  fill: string;
}

interface OutcomeStat {
  outcome: string;
  count: number;
}


function StatisticsTabContent() {
  const [diseaseData, setDiseaseData] = useState<DiseaseData[]>([]);
  const [isLoadingDiseaseStats, setIsLoadingDiseaseStats] = useState(true);
  const [fetchErrorDiseaseStats, setFetchErrorDiseaseStats] = useState<string | null>(null);

  const [ageGroupData, setAgeGroupData] = useState<AgeGroupStat[]>([]);
  const [isLoadingAgeStats, setIsLoadingAgeStats] = useState(true);
  const [fetchErrorAgeStats, setFetchErrorAgeStats] = useState<string | null>(null);

  const [serviceDistributionData, setServiceDistributionData] = useState<ServiceStat[]>([]);
  const [isLoadingServiceStats, setIsLoadingServiceStats] = useState(true);
  const [fetchErrorServiceStats, setFetchErrorServiceStats] = useState<string | null>(null);

  const [appointmentStatusData, setAppointmentStatusData] = useState<AppointmentStatusStat[]>([]);
  const [isLoadingAppointmentStatusStats, setIsLoadingAppointmentStatusStats] = useState(true);
  const [fetchErrorAppointmentStatusStats, setFetchErrorAppointmentStatusStats] = useState<string | null>(null);

  const [consultationOutcomeData, setConsultationOutcomeData] = useState<OutcomeStat[]>([]);
  const [isLoadingOutcomeStats, setIsLoadingOutcomeStats] = useState(true);
  const [fetchErrorOutcomeStats, setFetchErrorOutcomeStats] = useState<string | null>(null);


  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroup = (age: number): string => {
    if (age <= 10) return "0-10 ans";
    if (age <= 20) return "11-20 ans";
    if (age <= 30) return "21-30 ans";
    if (age <= 40) return "31-40 ans";
    if (age <= 50) return "41-50 ans";
    if (age <= 60) return "51-60 ans";
    if (age <= 70) return "61-70 ans";
    return "70+ ans";
  };

  const fetchDiseaseStats = useCallback(async () => {
    setIsLoadingDiseaseStats(true);
    setFetchErrorDiseaseStats(null);
    try {
      const medicalRecordsRef = collection(db, "dossiersMedicaux");
      const querySnapshot = await getDocs(medicalRecordsRef);
      
      const counts: { [key: string]: number } = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const diagnostic = data.diagnostic?.trim();
        if (diagnostic && diagnostic !== "") {
          counts[diagnostic] = (counts[diagnostic] || 0) + 1;
        }
      });

      const chartData = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); 
      
      setDiseaseData(chartData);

    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques des maladies :", error);
      let errorMessage = `Impossible de charger les statistiques des maladies. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied') {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour 'dossiersMedicaux'.";
      }
      setFetchErrorDiseaseStats(errorMessage);
    } finally {
      setIsLoadingDiseaseStats(false);
    }
  }, []);

  const fetchAgeStats = useCallback(async () => {
    setIsLoadingAgeStats(true);
    setFetchErrorAgeStats(null);
    try {
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const medicalRecordsSnapshot = await getDocs(collection(db, "dossiersMedicaux"));

      const patientsMap = new Map<string, PatientData>();
      patientsSnapshot.forEach(doc => {
        patientsMap.set(doc.id, { id: doc.id, ...doc.data() } as PatientData);
      });

      const consultedPatientIds = new Set<string>();
      medicalRecordsSnapshot.forEach(doc => {
        const recordData = doc.data();
        if (recordData.patientId) {
          consultedPatientIds.add(recordData.patientId);
        }
      });
      
      const ageCounts: { [key: string]: number } = {
        "0-10 ans": 0, "11-20 ans": 0, "21-30 ans": 0, "31-40 ans": 0,
        "41-50 ans": 0, "51-60 ans": 0, "61-70 ans": 0, "70+ ans": 0,
      };

      consultedPatientIds.forEach(patientId => {
        const patient = patientsMap.get(patientId);
        if (patient && patient.dob) {
          const age = calculateAge(patient.dob);
          const ageGroup = getAgeGroup(age);
          ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
        }
      });

      const ageChartData = Object.entries(ageCounts)
        .map(([ageGroup, count]) => ({ ageGroup, count }));
      
      setAgeGroupData(ageChartData);

    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques par âge :", error);
      let errorMessage = `Impossible de charger les statistiques par âge. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied') {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour 'patients' et/ou 'dossiersMedicaux'.";
      }
      setFetchErrorAgeStats(errorMessage);
    } finally {
      setIsLoadingAgeStats(false);
    }
  }, []);

  const fetchServiceDistributionStats = useCallback(async () => {
    setIsLoadingServiceStats(true);
    setFetchErrorServiceStats(null);
    try {
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const medicalRecordsSnapshot = await getDocs(collection(db, "dossiersMedicaux"));

      const patientServiceMap = new Map<string, string | undefined>();
      patientsSnapshot.forEach(doc => {
        const patientData = doc.data() as PatientData;
        patientServiceMap.set(doc.id, patientData.service);
      });

      const consultedPatientIds = new Set<string>();
      medicalRecordsSnapshot.forEach(doc => {
        const recordData = doc.data();
        if (recordData.patientId) {
          consultedPatientIds.add(recordData.patientId);
        }
      });

      const serviceCounts: { [key: string]: number } = {};
      consultedPatientIds.forEach(patientId => {
        const service = patientServiceMap.get(patientId) || "Non spécifié";
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });
      
      const serviceChartData = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count);

      setServiceDistributionData(serviceChartData);

    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques par service :", error);
      let errorMessage = `Impossible de charger les statistiques par service. ${error.message || "Erreur inconnue."}`;
       if (error.code === 'permission-denied') {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore.";
      }
      setFetchErrorServiceStats(errorMessage);
    } finally {
      setIsLoadingServiceStats(false);
    }
  }, []);

  const fetchAppointmentStatusStats = useCallback(async () => {
    setIsLoadingAppointmentStatusStats(true);
    setFetchErrorAppointmentStatusStats(null);
    try {
      const appointmentsSnapshot = await getDocs(collection(db, "appointments"));
      const statusCounts: { [key: string]: number } = {
        'Prévu': 0,
        'Terminé': 0,
        'Annulé': 0,
        'Absent': 0,
      };
      let otherStatusCount = 0;

      appointmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.status;
        if (status && typeof status === 'string') {
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
          } else {
            otherStatusCount++; 
          }
        }
      });
      
      const chartData: Omit<AppointmentStatusStat, 'fill'>[] = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }));
      
      if (otherStatusCount > 0) {
        chartData.push({ status: 'Autre/Inconnu', count: otherStatusCount });
      }

      // Assign colors based on status for the chart
      const coloredChartData = chartData.map(item => {
        let fill = 'hsl(var(--muted))'; // Default color
        if (item.status === 'Prévu') fill = 'hsl(var(--primary))';
        else if (item.status === 'Terminé') fill = 'hsl(var(--accent))';
        else if (item.status === 'Annulé') fill = 'hsl(var(--destructive))';
        else if (item.status === 'Absent') fill = 'hsl(var(--secondary))'; // Using secondary for Absent
        return { ...item, fill };
      });
      
      setAppointmentStatusData(coloredChartData.filter(d => d.count > 0));

    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques de statut des RDV :", error);
      let errorMessage = `Impossible de charger les statistiques des RDV par statut. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied') {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour 'appointments'.";
      }
      setFetchErrorAppointmentStatusStats(errorMessage);
    } finally {
      setIsLoadingAppointmentStatusStats(false);
    }
  }, []);
  
  const fetchConsultationOutcomeStats = useCallback(async () => {
    setIsLoadingOutcomeStats(true);
    setFetchErrorOutcomeStats(null);
    try {
      const medicalRecordsRef = collection(db, "dossiersMedicaux");
      const querySnapshot = await getDocs(medicalRecordsRef);
      
      const counts: { [key: string]: number } = {};
      consultationOutcomes.forEach(o => counts[o.value] = 0); 

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const outcome = data.issueConsultation?.trim();
        if (outcome && outcome !== "") {
          if (counts.hasOwnProperty(outcome)) {
            counts[outcome]++;
          } else {
            // If outcome from DB is not in our predefined list, still count it under its own name.
            // Or, decide to group under "Autre" if that's preferred. For now, count separately.
            counts[outcome] = (counts[outcome] || 0) + 1;
          }
        }
      });

      const chartData = Object.entries(counts)
        .map(([outcome, count]) => ({ outcome, count }))
        .filter(item => item.count > 0 || consultationOutcomes.some(o => o.value === item.outcome)) 
        .sort((a, b) => b.count - a.count); 
      
      setConsultationOutcomeData(chartData);

    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques d'issue de consultation :", error);
      let errorMessage = `Impossible de charger les statistiques d'issue. ${error.message || "Erreur inconnue."}`;
      if (error.code === 'permission-denied') {
          errorMessage += " Veuillez vérifier vos règles de sécurité Firestore pour 'dossiersMedicaux'.";
      }
      setFetchErrorOutcomeStats(errorMessage);
    } finally {
      setIsLoadingOutcomeStats(false);
    }
  }, []);


  useEffect(() => {
    fetchDiseaseStats();
    fetchAgeStats();
    fetchServiceDistributionStats();
    fetchAppointmentStatusStats();
    fetchConsultationOutcomeStats();
  }, [fetchDiseaseStats, fetchAgeStats, fetchServiceDistributionStats, fetchAppointmentStatusStats, fetchConsultationOutcomeStats]);

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-semibold">Statistiques et Visualisations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Maladies les plus fréquentes (Top 10)</CardTitle>
          <CardDescription>Distribution des maladies diagnostiquées dans les dossiers médicaux.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          {isLoadingDiseaseStats && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p>Chargement des statistiques des maladies...</p>
            </div>
          )}
          {!isLoadingDiseaseStats && fetchErrorDiseaseStats && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{fetchErrorDiseaseStats}</AlertDescription>
            </Alert>
          )}
          {!isLoadingDiseaseStats && !fetchErrorDiseaseStats && diseaseData.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée de diagnostic trouvée pour générer les statistiques.
            </p>
          )}
          {!isLoadingDiseaseStats && !fetchErrorDiseaseStats && diseaseData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData} layout="vertical" margin={{ right: 30, left: 20, bottom: 5, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false}/>
                <YAxis dataKey="name" type="category" width={150} interval={0} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre de cas" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des Patients Ayant Consulté par Tranche d'Âge</CardTitle>
          <CardDescription>Distribution par âge des patients ayant au moins un dossier médical.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          {isLoadingAgeStats && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p>Chargement des statistiques par âge...</p>
            </div>
          )}
          {!isLoadingAgeStats && fetchErrorAgeStats && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{fetchErrorAgeStats}</AlertDescription>
            </Alert>
          )}
          {!isLoadingAgeStats && !fetchErrorAgeStats && ageGroupData.every(d => d.count === 0) && (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée de consultation ou de patient trouvée pour générer les statistiques par âge.
            </p>
          )}
          {!isLoadingAgeStats && !fetchErrorAgeStats && !ageGroupData.every(d => d.count === 0) && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroupData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--accent))" name="Nombre de Patients" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des Patients Ayant Consulté par Service Médical</CardTitle>
          <CardDescription>Distribution des patients (avec dossier médical) par service.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          {isLoadingServiceStats && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p>Chargement des statistiques par service...</p>
            </div>
          )}
          {!isLoadingServiceStats && fetchErrorServiceStats && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{fetchErrorServiceStats}</AlertDescription>
            </Alert>
          )}
          {!isLoadingServiceStats && !fetchErrorServiceStats && serviceDistributionData.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée de consultation ou de patient avec service trouvée.
            </p>
          )}
          {!isLoadingServiceStats && !fetchErrorServiceStats && serviceDistributionData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistributionData} layout="vertical" margin={{ right: 30, left: 20, bottom: 5, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false}/>
                <YAxis dataKey="service" type="category" width={150} interval={0} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--secondary))" name="Nombre de Patients" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des Rendez-vous par Statut</CardTitle>
          <CardDescription>Distribution des rendez-vous selon leur statut actuel.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          {isLoadingAppointmentStatusStats && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p>Chargement des statistiques des statuts de RDV...</p>
            </div>
          )}
          {!isLoadingAppointmentStatusStats && fetchErrorAppointmentStatusStats && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{fetchErrorAppointmentStatusStats}</AlertDescription>
            </Alert>
          )}
          {!isLoadingAppointmentStatusStats && !fetchErrorAppointmentStatusStats && appointmentStatusData.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée de rendez-vous trouvée pour générer les statistiques par statut.
            </p>
          )}
          {!isLoadingAppointmentStatusStats && !fetchErrorAppointmentStatusStats && appointmentStatusData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Nombre de RDV">
                   {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Répartition des Issues de Consultation</CardTitle>
          <CardDescription>Distribution des issues enregistrées dans les dossiers médicaux.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          {isLoadingOutcomeStats && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p>Chargement des statistiques d'issue...</p>
            </div>
          )}
          {!isLoadingOutcomeStats && fetchErrorOutcomeStats && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{fetchErrorOutcomeStats}</AlertDescription>
            </Alert>
          )}
          {!isLoadingOutcomeStats && !fetchErrorOutcomeStats && consultationOutcomeData.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnée d'issue de consultation trouvée.
            </p>
          )}
          {!isLoadingOutcomeStats && !fetchErrorOutcomeStats && consultationOutcomeData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationOutcomeData} layout="vertical" margin={{ right: 30, left: 30, bottom: 5, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis 
                  dataKey="outcome" 
                  type="category" 
                  width={150} 
                  interval={0} 
                  tickFormatter={(value) => consultationOutcomes.find(o => o.value === value)?.label || value}
                />
                <Tooltip formatter={(value, name, props) => {
                    const outcomeLabel = consultationOutcomes.find(o => o.value === props.payload.outcome)?.label || props.payload.outcome;
                    return [value, outcomeLabel];
                }} />
                <Legend formatter={() => "Nombre de cas"}/>
                <Bar dataKey="count" fill="hsl(var(--chart-5))" name="Nombre de cas" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminTabContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Lock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">Administration et Sécurité</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Comptes Utilisateurs</CardTitle>
          <CardDescription>Contrôle des accès et des rôles des utilisateurs de l'application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cette section est destinée aux administrateurs pour gérer les comptes du personnel (médecins, infirmiers, secrétaires, etc.).
            Actuellement, l'authentification est gérée par Firebase, mais la gestion fine des rôles et permissions n'est pas encore implémentée.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
            <h3 className="font-semibold text-md">Fonctionnalités Prévues :</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Création et assignation de rôles (ex: Administrateur, Médecin, Personnel Soignant).</li>
              <li>Invitation de nouveaux utilisateurs avec des rôles spécifiques.</li>
              <li>Activation/désactivation de comptes utilisateurs.</li>
              <li>Visualisation de la liste des utilisateurs et de leurs rôles.</li>
              <li>Réinitialisation des mots de passe (si les permissions le permettent).</li>
            </ul>
          </div>
           <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>En Développement</AlertTitle>
            <AlertDescription>
              Ces fonctionnalités avancées de gestion des comptes sont en cours de conception et seront implémentées progressivement.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité des Données</CardTitle>
          <CardDescription>Principes et mesures pour la protection des informations sensibles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            La sécurité des données médicales est primordiale. L'application s'appuie sur les services Firebase (Authentication et Firestore)
            qui offrent des mécanismes de sécurité robustes.
          </p>
          <h3 className="font-semibold text-md">Aspects Clés :</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>
              <strong>Authentification :</strong> Gérée par Firebase Authentication, assurant que seuls les utilisateurs enregistrés et connectés peuvent accéder à l'application.
            </li>
            <li>
              <strong>Règles de Sécurité Firestore :</strong>
              <span className="block text-muted-foreground">
                Essentielles pour contrôler l'accès en lecture et en écriture aux données. 
                <strong> Les règles actuelles sont probablement permissives pour le développement. Elles devront être rigoureusement renforcées avant toute utilisation en production</strong> pour garantir que les utilisateurs ne peuvent accéder qu'aux données autorisées par leur rôle.
              </span>
            </li>
            <li>
              <strong>Chiffrement :</strong> Firebase chiffre les données en transit (HTTPS) et au repos.
            </li>
            <li>
              <strong>Journalisation et Audit (Futur) :</strong> Pour une application en production, des mécanismes de journalisation des accès et des modifications importantes seraient nécessaires.
            </li>
            <li>
              <strong>Sauvegardes :</strong> Firestore offre des fonctionnalités de sauvegarde et de restauration.
            </li>
          </ul>
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Requise Avant Production</AlertTitle>
            <AlertDescription>
              La configuration et le test approfondi des Règles de Sécurité Firestore sont une étape critique avant de considérer cette application pour un usage réel avec des données sensibles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component for tabs to ensure Suspense is used correctly
function MainAppPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  // Define tabs configuration
  const tabsConfig = [
    { value: 'dashboard', label: 'Tableau de Bord', icon: BrainCircuit, content: <DashboardTabContent /> },
    { value: 'patients', label: 'Patients', icon: Users, content: <PatientsTabContent /> },
    { value: 'appointments', label: 'Rendez-vous', icon: CalendarDays, content: <AppointmentsTabContent /> },
    { value: 'new-medical-record', label: 'Nouv. Dossier', icon: FileText, content: <NewMedicalRecordTabContent /> },
    { value: 'staff', label: 'Personnel', icon: Users2, content: <StaffTabContent /> },
    { value: 'statistics', label: 'Statistiques', icon: LineChartIcon, content: <StatisticsTabContent /> },
    { value: 'admin', label: 'Admin', icon: ShieldCheck, content: <AdminTabContent /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue={currentTab} value={currentTab} className="flex-grow flex flex-col">
        <div className="overflow-x-auto sticky top-0 bg-background z-10 shadow-sm border-b mb-4">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-max">
            {tabsConfig.map((tab) => (
              <TabsTrigger value={tab.value} asChild key={tab.value}>
                <Link href={`/dashboard?tab=${tab.value}`}>
                  <span className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-grow overflow-y-auto p-1">
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0" style={{ display: currentTab === tab.value ? 'block' : 'none' }}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="mr-2 h-8 w-8 animate-spin" />Chargement de l'application...</div>}>
      <MainAppPage />
    </Suspense>
  );
}
    

    







