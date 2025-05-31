
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
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import type { EmergencyCaseAnalysis } from "@/ai/flows/emergency-flow";
import { analyzeEmergencyCase } from "@/ai/flows/emergency-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BrainCircuit, Users, CalendarDays, LineChartIcon, ShieldCheck, PlusCircle, Eye, Search, FileText, CalendarIcon as LucideCalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { format } from 'date-fns';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const patientsSnapshot = await getDocs(collection(db, "patients"));
        setActivePatients(patientsSnapshot.size);
        // Placeholder for appointments today
        setAppointmentsToday(5); 

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
            <p className="text-4xl font-bold">{activePatients !== null ? activePatients : "Chargement..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
            <CardDescription>Nombre de rendez-vous prévus aujourd'hui (donnée exemple).</CardDescription>
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
  createdAt?: Timestamp; 
}

function PatientsTabContent() {
  console.log("[PatientsTabContent] Rendering simplified placeholder.");
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
            Contenu de la liste des patients temporairement désactivé pour débogage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            La liste des patients est en cours de maintenance.
          </p>
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
  status: 'Prévu' | 'Terminé' | 'Annulé' | string; 
  reason?: string;
}

const appointmentFormSchema = z.object({
  patientId: z.string({ required_error: "Veuillez sélectionner un patient." }),
  doctorName: z.string().min(2, { message: "Le nom du médecin doit contenir au moins 2 caractères." }),
  appointmentDate: z.date({ required_error: "La date du rendez-vous est requise." }),
  appointmentHour: z.string().regex(/^([01]\d|2[0-3])$/, { message: "Heure invalide (00-23)." }),
  appointmentMinute: z.string().regex(/^[0-5]\d$/, { message: "Minute invalide (00-59)." }),
  reason: z.string().min(5, { message: "Le motif doit contenir au moins 5 caractères." }).optional().or(z.literal('')),
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
          reason: data.reason
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
  }, []); // useCallback dependencies

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const fetchPatientsForSelect = async () => {
      if (!isAddAppointmentDialogOpen) return; // Only fetch if dialog is open or about to open
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

      const newAppointment = {
        patientId: data.patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorName: data.doctorName,
        dateTime: Timestamp.fromDate(appointmentDateTime),
        reason: data.reason || "",
        status: "Prévu", // Default status
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "appointments"), newAppointment);
      toast.success("Rendez-vous planifié avec succès !");
      appointmentForm.reset();
      setIsAddAppointmentDialogOpen(false);
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      console.error("Erreur lors de la planification du rendez-vous :", error);
      toast.error("Erreur lors de la planification du rendez-vous.", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue."
      });
    } finally {
      setIsSubmittingAppointment(false);
    }
  }


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
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isSubmittingAppointment} // Prevent past dates
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
                    <th scope="col" className="px-6 py-3">Statut</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rdv.status === 'Prévu' ? 'bg-primary/20 text-primary' :
                          rdv.status === 'Terminé' ? 'bg-accent/20 text-accent-foreground dark:text-accent' : 
                          rdv.status === 'Annulé' ? 'bg-destructive/20 text-destructive' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {rdv.status}
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

const medicalRecordFormSchema = z.object({
  consultationDate: z.date({
    required_error: "La date de consultation est requise.",
  }),
  motifConsultation: z.string().min(5, { message: "Le motif doit contenir au moins 5 caractères." }).optional().or(z.literal('')),
  symptomes: z.string().min(5, { message: "Les symptômes doivent contenir au moins 5 caractères." }).optional().or(z.literal('')),
  diagnostic: z.string().min(3, { message: "Le diagnostic doit contenir au moins 3 caractères." }).optional().or(z.literal('')),
  traitementPrescrit: z.string().optional(),
  notesMedecin: z.string().optional(),
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
          <CardDescription>Distribution des maladies diagnostiquées (données exemples).</CardDescription>
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
    

