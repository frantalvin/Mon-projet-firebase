
'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription as UiAlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, UserCircle, Briefcase, Mail, Phone, CalendarPlus, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';

interface StaffDetailsData {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
  email?: string;
  phone?: string;
  createdAt?: Timestamp;
}

interface PageProps {
  params: { id: string };
}

export default function StaffDetailPage({ params }: PageProps) {
  const { id: staffId } = params;

  const [staffMember, setStaffMember] = useState<StaffDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId) {
      setError("ID du membre du personnel non fourni.");
      setIsLoading(false);
      return;
    }

    const fetchStaffDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const staffDocRef = doc(db, "staff", staffId);
        const staffDocSnap = await getDoc(staffDocRef);

        if (staffDocSnap.exists()) {
          setStaffMember({ id: staffDocSnap.id, ...staffDocSnap.data() } as StaffDetailsData);
        } else {
          setError("Membre du personnel non trouvé.");
        }
      } catch (err: any) {
        console.error("Error fetching staff details:", err);
        setError(`Erreur lors de la récupération des détails du membre du personnel : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffDetails();
  }, [staffId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Chargement des détails du membre du personnel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste du personnel
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

  if (!staffMember) {
    return (
       <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste du personnel
          </Link>
        </Button>
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Membre du Personnel Introuvable</AlertTitle>
          <UiAlertDescription>Aucun membre du personnel trouvé avec l'ID {staffId}.</UiAlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Détails du Membre du Personnel</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{staffMember.firstName} {staffMember.lastName}</CardTitle>
          <CardDescription>{staffMember.role}{staffMember.specialty ? ` - ${staffMember.specialty}` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center">
            <UserCircle className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Nom complet :</strong> {staffMember.firstName} {staffMember.lastName}</p>
          </div>
           <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-muted-foreground mr-3" />
            <p><strong>Rôle :</strong> {staffMember.role}</p>
          </div>
          {staffMember.specialty && (
            <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-muted-foreground mr-3" /> {/* Peut-être une autre icône pour spécialité? */}
                <p><strong>Spécialité :</strong> {staffMember.specialty}</p>
            </div>
          )}
          {staffMember.email && (
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3" />
              <p><strong>Email :</strong> <a href={`mailto:${staffMember.email}`} className="text-primary hover:underline">{staffMember.email}</a></p>
            </div>
          )}
          {staffMember.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-muted-foreground mr-3" />
              <p><strong>Téléphone :</strong> {staffMember.phone}</p>
            </div>
          )}
           {staffMember.createdAt && (
            <div className="flex items-center">
                <CalendarPlus className="h-5 w-5 text-muted-foreground mr-3" />
                <p className="text-xs text-muted-foreground">
                Membre depuis le : {format(staffMember.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr })}
                </p>
            </div>
          )}
        </CardContent>
        {/* CardFooter peut être ajouté ici pour des actions comme "Modifier" ou "Supprimer" plus tard */}
      </Card>
    </div>
  );
}

    