"use client";

import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { getUpcomingAppointments, isLoading } = useAppContext();
  const upcomingAppointments = getUpcomingAppointments(5); // Show next 5

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Upcoming Appointments</CardTitle>
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
                      <Badge variant={appt.status === 'Scheduled' ? 'default' : 'secondary'}>
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
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button asChild>
                <Link href="/patients/new">Register New Patient</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/patients">View All Patients</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
