
'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, CalendarClock, User, Stethoscope, FileTextIcon, CheckCircle2, XCircle, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';

interface AppointmentDetailsData {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  dateTime: Timestamp;
  reason?: string;
  status: 'Prévu' | 'Terminé' | 'Annulé' | string;
  createdAt?: Timestamp;
}

export default function AppointmentDetailPage({ params: paramsProp }: { params: { id: string } }) {
  const resolvedParams = use(paramsProp);
  const appointmentId = resolvedParams.id;

  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) {
      setError("ID du rendez-vous non fourni.");
      setIsLoading(false);
      return;
    }

    const fetchAppointmentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const appointmentDocRef = doc(db, "appointments", appointmentId);
        const appointmentDocSnap = await getDoc(appointmentDocRef);

        if (appointmentDocSnap.exists()) {
          setAppointment({ id: appointmentDocSnap.id, ...appointmentDocSnap.data() } as AppointmentDetailsData);
        } else {
          setError("Rendez-vous non trouvé.");
        }
      } catch (err: any) {
        console.error("Error fetching appointment details:", err);
        setError(`Erreur lors de la récupération des détails du rendez-vous : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Chargement des détails du rendez-vous...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des rendez-vous
          </Link>
        </Button>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <UiAlertDescription>{error}</UiAlertDescription>
        </Alert>
      </div>
    );
  }

  if (!appointment) {
    return (
       <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des rendez-vous
          </Link>
        </Button>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rendez-vous Introuvable</AlertTitle>
          <UiAlertDescription>Aucun rendez-vous trouvé avec l'ID {appointmentId}.</UiAlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Terminé') return <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />;
    if (status === 'Annulé') return <XCircle className="h-5 w-5 text-red-500 mr-2" />;
    if (status === 'Prévu') return <CalendarClock className="h-5 w-5 text-blue-500 mr-2" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />;
  };
  
  const getStatusClass = (status: string) => {
    if (status === 'Terminé') return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-700/30';
    if (status === 'Annulé') return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-700/30';
    if (status === 'Prévu') return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30';
    return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-700/30';
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Détails du Rendez-vous</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous du {format(appointment.dateTime.toDate(), 'dd MMMM yyyy \'à\' HH:mm', { locale: fr })}</CardTitle>
          <CardDescription>Patient : {appointment.patientName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center">
            <User className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Patient :</strong> {appointment.patientName} (ID: {appointment.patientId})</p>
          </div>
           <div className="flex items-center">
            <Stethoscope className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Médecin :</strong> {appointment.doctorName}</p>
          </div>
          <div className="flex items-center">
            <CalendarClock className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Date et Heure :</strong> {format(appointment.dateTime.toDate(), 'eeee dd MMMM yyyy \'à\' HH:mm', { locale: fr })}</p>
          </div>
          <div className="flex items-center">
            {getStatusIcon(appointment.status)}
            <p><strong>Statut :</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>{appointment.status}</span></p>
          </div>
          {appointment.reason && (
            <div className="flex items-start">
              <FileTextIcon className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <p className="font-semibold">Motif de la consultation :</p>
                <p className="whitespace-pre-wrap">{appointment.reason}</p>
              </div>
            </div>
          )}
           {appointment.createdAt && (
            <p className="text-xs text-muted-foreground pt-2">
              Rendez-vous créé le: {format(appointment.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr })}
            </p>
          )}
        </CardContent>
      </Card>
      {/* Possibilité d'ajouter des actions : Modifier le statut, Annuler, etc. */}
    </div>
  );
}
