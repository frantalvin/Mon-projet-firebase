
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app-context";
import { PatientForm } from "@/components/patient-form";
import { PatientSummaryGenerator } from "@/components/patient-summary-generator";
import { AppointmentScheduler } from "@/components/appointment-scheduler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, User, Calendar, StickyNote, ScrollText, UsersRound, SparklesIcon, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import type { Patient, Appointment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useLocale } from "next-intl";

// TODO: Translate this page content using useTranslations
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { findPatientById, getAppointmentsByPatientId, updatePatient, isLoading: isAppContextLoading } = useAppContext();
  const { toast } = useToast();
  const locale = useLocale();

  const [patient, setPatient] = useState<Patient | null | undefined>(undefined); // undefined for loading, null for not found
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  const patientId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (patientId && !isAppContextLoading) {
      const foundPatient = findPatientById(patientId);
      setPatient(foundPatient);
      if (foundPatient) {
        setAppointments(getAppointmentsByPatientId(patientId));
      }
    }
  }, [patientId, findPatientById, getAppointmentsByPatientId, isAppContextLoading]);

  const handleAppointmentScheduled = (newAppointment: Appointment) => {
    setAppointments(prev => [newAppointment, ...prev].sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
  };
  
  const handleUpdatePatient = (data: any) => {
    if (!patient) return;
    setIsSubmittingEdit(true);
    try {
      const updatedPatientData = { ...patient, ...data };
      updatePatient(updatedPatientData);
      setPatient(updatedPatientData); // Update local state immediately
      toast({
        title: "Patient Updated", // TODO: Translate
        description: `${patient.name}'s details have been successfully updated.`, // TODO: Translate
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error", // TODO: Translate
        description: "Failed to update patient details. Please try again.", // TODO: Translate
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getBadgeVariant = (status: Appointment['status']) => {
    if (status === 'Scheduled') return 'default';
    if (status === 'Completed') return 'accent';
    return 'destructive';
  };


  if (isAppContextLoading || patient === undefined) {
    return <div className="flex justify-center items-center h-64">Loading patient details...</div>; // TODO: Translate
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <UsersRound className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Patient Not Found</h2> 
        <p className="mt-2 text-muted-foreground">The patient with the specified ID could not be found.</p> 
        <Button asChild className="mt-6">
          <Link href={`/${locale}/patients`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Patients List 
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients 
      </Button>

      {isEditing ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Edit Patient: {patient.name}</CardTitle> 
          </CardHeader>
          <CardContent>
            <PatientForm patient={patient} onSubmit={handleUpdatePatient} isSubmitting={isSubmittingEdit} />
             <Button variant="outline" onClick={() => setIsEditing(false)} className="mt-4">
              Cancel Edit 
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center">
                <User className="mr-3 h-8 w-8 text-primary" />
                {patient.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Patient ID: {patient.id} &bull; Registered: {format(new Date(patient.registrationDate), "PP")} 
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Patient 
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><strong>Date of Birth:</strong> {format(new Date(patient.dob), "PP")}</div> 
            <div><strong>Gender:</strong> {patient.gender}</div> 
            <div><strong>Contact:</strong> {patient.contact}</div> 
            <div><strong>Address:</strong> {patient.address}</div> 
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="history"><ScrollText className="mr-2 h-4 w-4" />Patient History</TabsTrigger> 
          <TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger> 
          <TabsTrigger value="ai_summary"><SparklesIcon className="mr-2 h-4 w-4" />AI Summary</TabsTrigger> 
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                 <StickyNote className="h-5 w-5 text-primary" /> Full Medical History & Notes 
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {patient.medicalHistory || "No detailed medical history recorded."} 
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-xl">Appointment Log</CardTitle> 
              <AppointmentScheduler patient={patient} onAppointmentScheduled={handleAppointmentScheduled} />
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead> 
                      <TableHead>Reason</TableHead> 
                      <TableHead>Status</TableHead> 
                      <TableHead>Notes</TableHead> 
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>{format(new Date(appt.dateTime), "PPpp")}</TableCell>
                        <TableCell>{appt.reason}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(appt.status)}>
                            {appt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{appt.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No appointments recorded for this patient.</p> 
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai_summary" className="mt-4">
          <PatientSummaryGenerator patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
