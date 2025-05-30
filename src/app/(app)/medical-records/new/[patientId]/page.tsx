
// src/app/(app)/medical-records/new/[patientId]/page.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp, doc, getDoc } from "firebase/firestore";
import { useState, useEffect, use } from "react"; // Added 'use'
import { useRouter } from 'next/navigation'; // No need for useParams, use 'params' prop
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";


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

interface PatientInfo {
  firstName: string;
  lastName: string;
}

export default function NewMedicalRecordEntryPage({ params: paramsProp }: { params: { patientId: string } }) {
  const router = useRouter();
  const resolvedParams = use(paramsProp); // Use React.use to unwrap params promise
  const patientIdFromParams = resolvedParams?.patientId; 
  console.log('[NewMedicalRecordEntryPage] patientIdFromParams from URL:', patientIdFromParams);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[NewMedicalRecordEntryPage] useEffect triggered. patientIdFromParams:', patientIdFromParams);
    if (patientIdFromParams) {
      const fetchPatientInfo = async () => {
        setIsLoadingPatient(true);
        setPageError(null);
        try {
          const patientDocRef = doc(db, "patients", patientIdFromParams);
          const patientDocSnap = await getDoc(patientDocRef);
          if (patientDocSnap.exists()) {
            setPatientInfo(patientDocSnap.data() as PatientInfo);
            console.log('[NewMedicalRecordEntryPage] Patient info loaded:', patientDocSnap.data());
          } else {
            const errorMsg = `Patient non trouvé avec l'ID : ${patientIdFromParams}`;
            toast.error("Patient non trouvé.", { description: errorMsg });
            setPageError(errorMsg);
            console.warn('[NewMedicalRecordEntryPage]', errorMsg);
          }
        } catch (error: any) {
          const errorMsg = `Erreur de chargement du patient: ${error.message}`;
          console.error("[NewMedicalRecordEntryPage] Erreur lors de la récupération des informations du patient:", error);
          toast.error("Erreur de chargement du patient.");
          setPageError(errorMsg);
        } finally {
          setIsLoadingPatient(false);
        }
      };
      fetchPatientInfo();
    } else {
      const errorMsg = "ID du patient manquant dans l'URL.";
      console.error('[NewMedicalRecordEntryPage]', errorMsg);
      setPageError(errorMsg);
      setIsLoadingPatient(false);
    }
  }, [patientIdFromParams]);

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

  async function onSubmit(data: MedicalRecordFormValues) {
    if (!patientIdFromParams) {
      toast.error("Erreur : ID du patient manquant.");
      console.error('[NewMedicalRecordEntryPage] onSubmit: patientIdFromParams is missing');
      return;
    }
    if (!patientInfo) {
      toast.error("Erreur : Informations du patient non chargées.");
      console.error('[NewMedicalRecordEntryPage] onSubmit: patientInfo is null');
      return;
    }

    setIsSubmitting(true);
    try {
      const medicalRecordData = {
        ...data,
        patientId: patientIdFromParams,
        consultationDate: Timestamp.fromDate(data.consultationDate),
        createdAt: serverTimestamp(),
      };

      console.log('[NewMedicalRecordEntryPage] Submitting medical record data:', medicalRecordData);
      const docRef = await addDoc(collection(db, "dossiersMedicaux"), medicalRecordData);
      toast.success("Dossier médical enregistré avec succès!", {
        description: `Nouveau dossier créé pour ${patientInfo?.firstName || ''} ${patientInfo?.lastName || ''} (ID: ${docRef.id})`,
      });
      form.reset();
      router.push(`/patients/${patientIdFromParams}`); 
    } catch (error: any) {
      console.error("[NewMedicalRecordEntryPage] Erreur lors de l'enregistrement du dossier médical :", error);
      toast.error("Erreur lors de l'enregistrement du dossier.", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingPatient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3">Chargement des informations du patient...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <UiAlertDescription>{pageError}</UiAlertDescription>
        </Alert>
        <Button variant="outline" asChild className="mt-4">
            <Link href={patientIdFromParams ? `/patients/${patientIdFromParams}` : "/dashboard?tab=patients"}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la fiche patient
            </Link>
        </Button>
      </div>
    );
  }
  
  if (!patientInfo) { 
     return (
      <div className="container mx-auto py-10 text-center">
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Patient introuvable</AlertTitle>
            <UiAlertDescription> 
                Les informations du patient n'ont pas pu être chargées pour l'ID : {patientIdFromParams || "inconnu"}.
            </UiAlertDescription>
        </Alert>
        <Button variant="outline" asChild className="mt-4">
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
         <Link href={patientIdFromParams ? `/patients/${patientIdFromParams}` : "/dashboard?tab=patients"}>
           <ArrowLeft className="mr-2 h-4 w-4" />
           Retour à la Fiche Patient
         </Link>
       </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Nouvelle Consultation / Entrée au Dossier Médical</CardTitle>
          {patientInfo && (
            <CardDescription>
              Ajout d'une nouvelle entrée pour le patient : {patientInfo.firstName} {patientInfo.lastName} (ID: {patientIdFromParams})
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="consultationDate"
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
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isLoadingPatient || !patientInfo}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                ) : (
                  "Enregistrer la Consultation"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    