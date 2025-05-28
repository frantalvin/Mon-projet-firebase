
"use client";

import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale"; // Importer la locale française
import { CalendarClock, UsersRound, ClipboardList, CalendarCheck2 } from "lucide-react";
import Link from "next-intl/navigation";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { 
    getUpcomingAppointments, 
    isLoading, 
    getTotalPatients,
    getTotalAppointments,
    getAppointmentsTodayCount 
  } = useAppContext();
  
  const upcomingAppointments = getUpcomingAppointments(5); // Show next 5
  const totalPatients = getTotalPatients();
  const totalAppointments = getTotalAppointments();
  const appointmentsTodayCount = getAppointmentsTodayCount();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('loading')}</div>;
  }

  const getBadgeVariant = (status: Appointment['status']) => {
    if (status === 'Scheduled') return 'default';
    if (status === 'Completed') return 'accent'; // Utilise la variante 'accent' pour 'Terminé'
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalPatientsTitle')}</CardTitle> 
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">{t('totalPatientsDescription')}</p> 
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalAppointmentsTitle')}</CardTitle> 
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">{t('totalAppointmentsDescription')}</p> 
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('appointmentsTodayTitle')}</CardTitle> 
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsTodayCount}</div>
            <p className="text-xs text-muted-foreground">{t('appointmentsTodayDescription')}</p> 
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments Section */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">{t('upcomingAppointmentsTitle')}</CardTitle> 
          <CalendarClock className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaderPatient')}</TableHead> 
                  <TableHead>{t('tableHeaderDateTime')}</TableHead> 
                  <TableHead>{t('tableHeaderReason')}</TableHead> 
                  <TableHead>{t('tableHeaderStatus')}</TableHead> 
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <Link href={`/patients/${appt.patientId}`} className="hover:underline text-primary">
                        {appt.patientName}
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(appt.dateTime), "PPpp", { locale: fr })}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(appt.status)}>
                        {t(`status${appt.status}` as any)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardDescription>{t('noUpcomingAppointments')}</CardDescription> 
          )}
           <div className="mt-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/appointments">{t('viewAllAppointmentsButton')}</Link> 
            </Button>
           </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions Section */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-bold">{t('quickActionsTitle')}</CardTitle> 
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
                <Link href="/patients/new">{t('registerNewPatientButton')}</Link> 
            </Button>
            <Button variant="outline" asChild>
                <Link href="/patients">{t('viewAllPatientsButton')}</Link> 
            </Button>
             <Button variant="outline" asChild>
                <Link href="/appointments">{t('manageAppointmentsButton')}</Link> 
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
