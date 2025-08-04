
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, CalendarClock, User, Stethoscope, FileTextIcon, CheckCircle2, XCircle, AlertCircle, Loader2, AlertTriangle, UserX, CreditCard, DollarSign, CheckCheck } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface AppointmentDetailsData {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  dateTime: Timestamp;
  reason?: string;
  status: 'Prévu' | 'Terminé' | 'Annulé' | 'Absent' | string;
  createdAt?: Timestamp;
  consultationFee?: number;
  paymentStatus?: 'Impayé' | 'Payé';
  paymentDate?: Timestamp;
  paymentMethod?: string;
}

interface PageProps {
  params: { id: string };
}

export default function AppointmentDetailPage({ params }: PageProps) {
  const { id: appointmentId } = params;

  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);


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
        const appointmentDocRef = doc(db, "appointments", appointmentId as string);
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

  const handleUpdateStatus = async (newStatus: AppointmentDetailsData['status']) => {
    if (!appointment) return;
    setIsUpdatingStatus(true);
    try {
      const appointmentDocRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentDocRef, { status: newStatus });
      setAppointment(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Statut du rendez-vous mis à jour à "${newStatus}".`);
    } catch (err: any) {
      console.error("Error updating appointment status:", err);
      toast.error(`Erreur lors de la mise à jour du statut : ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!appointment || !selectedPaymentMethod) { 
      toast.error("Impossible d'enregistrer le paiement. Informations manquantes ou méthode de paiement non sélectionnée.");
      return;
    }
    setIsProcessingPayment(true);
    try {
      const appointmentDocRef = doc(db, "appointments", appointment.id);
      const paymentData = {
        paymentStatus: 'Payé' as 'Payé',
        paymentDate: Timestamp.now(),
        paymentMethod: selectedPaymentMethod,
      };
      await updateDoc(appointmentDocRef, paymentData);
      setAppointment(prev => prev ? {
        ...prev,
        ...paymentData
      } : null);
      toast.success("Paiement enregistré avec succès !");
      setIsPaymentDialogOpen(false);
      setSelectedPaymentMethod(undefined);
    } catch (err: any) {
      console.error("Error recording payment:", err);
      toast.error(`Erreur lors de l'enregistrement du paiement : ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };


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
          <AlertDescription>{error}</AlertDescription>
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
          <AlertDescription>Aucun rendez-vous trouvé avec l'ID {appointmentId}.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Terminé') return <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />;
    if (status === 'Annulé') return <XCircle className="h-5 w-5 text-red-500 mr-2" />;
    if (status === 'Prévu') return <CalendarClock className="h-5 w-5 text-blue-500 mr-2" />;
    if (status === 'Absent') return <UserX className="h-5 w-5 text-orange-500 mr-2" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Terminé') return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-700/30';
    if (status === 'Annulé') return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-700/30';
    if (status === 'Prévu') return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30';
    if (status === 'Absent') return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-700/30';
    return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-700/30';
  };

  const getPaymentStatusClass = (status?: 'Impayé' | 'Payé') => {
    if (status === 'Payé') return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-700/30';
    return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-700/30'; // Impayé or undefined
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
          <CardTitle>Rendez-vous du {format(appointment.dateTime.toDate(), 'dd MMMM yyyy \\'à\\' HH:mm', { locale: fr })}</CardTitle>
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
            <p><strong>Date et Heure :</strong> {format(appointment.dateTime.toDate(), 'eeee dd MMMM yyyy \\'à\\' HH:mm', { locale: fr })}</p>
          </div>
          <div className="flex items-center">
            {getStatusIcon(appointment.status)}
            <p><strong>Statut RDV :</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>{appointment.status}</span></p>
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
          {typeof appointment.consultationFee === 'number' && (
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-muted-foreground mr-3" />
              <p><strong>Frais de consultation :</strong> {appointment.consultationFee.toFixed(2)} €</p>
            </div>
          )}
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Statut du paiement :</strong>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(appointment.paymentStatus)}`}>
                {appointment.paymentStatus || 'Impayé'}
              </span>
            </p>
          </div>
          {appointment.paymentStatus === 'Payé' && appointment.paymentDate && (
            <p className="text-xs text-muted-foreground pl-8">
              Payé le: {format(appointment.paymentDate.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr })}
              {appointment.paymentMethod && ` par ${appointment.paymentMethod}`}
            </p>
          )}
           {appointment.createdAt && (
            <p className="text-xs text-muted-foreground pt-2">
              Rendez-vous créé le: {format(appointment.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr })}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:justify-start gap-2 border-t pt-4 flex-wrap">
            {appointment.status === 'Prévu' && (
              <>
                <Button
                  onClick={() => handleUpdateStatus('Terminé')}
                  disabled={isUpdatingStatus}
                  variant="default"
                  size="sm"
                >
                  {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Marquer comme Terminé
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('Absent')}
                  disabled={isUpdatingStatus}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-500 dark:hover:bg-orange-900/30 dark:hover:text-orange-300"
                >
                  {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
                  Marquer comme Absent
                </Button>
                <Button
                    onClick={() => handleUpdateStatus('Annulé')}
                    disabled={isUpdatingStatus}
                    variant="destructive"
                    size="sm"
                 >
                   {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                   Annuler le RDV
                 </Button>
              </>
            )}

            { (appointment.status === 'Annulé' || appointment.status === 'Terminé' || appointment.status === 'Absent') && appointment.status !== 'Prévu' && (
                <p className="text-sm text-muted-foreground w-full basis-full">Le statut de ce rendez-vous ne peut plus être modifié.</p>
            )}

            {appointment.status === 'Terminé' && appointment.paymentStatus !== 'Payé' && (
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                disabled={isUpdatingStatus || isProcessingPayment}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-900/30 dark:hover:text-green-300"
              >
                {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                Enregistrer le Paiement
              </Button>
            )}
        </CardFooter>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer le paiement</DialogTitle>
            <DialogDescription>
              Confirmez les détails du paiement pour le rendez-vous de {appointment?.patientName}.
              <br />
              Montant à payer : {appointment?.consultationFee !== undefined ? `${appointment.consultationFee.toFixed(2)} €` : 'Non spécifié'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="payment-method">Méthode de paiement</Label>
            <Select onValueChange={setSelectedPaymentMethod} value={selectedPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Choisir une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Carte Bancaire">Carte Bancaire</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            { !selectedPaymentMethod && <p className="text-sm text-destructive">Veuillez sélectionner une méthode de paiement.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPaymentDialogOpen(false); setSelectedPaymentMethod(undefined); }} disabled={isProcessingPayment}>
              Annuler
            </Button>
            <Button onClick={handleRecordPayment} disabled={!selectedPaymentMethod || isProcessingPayment}>
              {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer Paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
