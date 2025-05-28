
"use client";

import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock, UsersRound, ClipboardList, CalendarCheck2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
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
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Currently registered in the system</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled, completed, or cancelled</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsTodayCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments Section */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
          <CalendarClock className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{format(new Date(appt.dateTime), "PPpp")}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
                    <TableCell>
                      <Badge variant={appt.status === 'Scheduled' ? 'default' : 'secondary'}
                       className={appt.status === 'Scheduled' ? 'bg-blue-500 hover:bg-blue-600' : appt.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                      >
                        {appt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardDescription>No upcoming appointments.</CardDescription>
          )}
           <div className="mt-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/appointments">View All Appointments</Link>
            </Button>
           </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions Section */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
                <Link href="/patients/new">Register New Patient</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/patients">View All Patients</Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href="/appointments">Manage Appointments</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
