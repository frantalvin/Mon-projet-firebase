"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Search, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Appointment } from "@/lib/types";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function AppointmentsPage() {
  const { appointments: allAppointments, isLoading, patients } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | "all">("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [patientFilter, setPatientFilter] = useState<string | "all">("all");
  
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const filteredAppointments = useMemo(() => {
    let appointments = [...allAppointments];

    if (searchTerm) {
      appointments = appointments.filter(appt =>
        appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      appointments = appointments.filter(appt => appt.status === statusFilter);
    }
    
    if (patientFilter !== "all") {
      appointments = appointments.filter(appt => appt.patientId === patientFilter);
    }

    if (dateFilter) {
      const selectedDate = format(dateFilter, "yyyy-MM-dd");
      appointments = appointments.filter(appt => format(new Date(appt.dateTime), "yyyy-MM-dd") === selectedDate);
    }
    
    return appointments.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [allAppointments, searchTerm, statusFilter, dateFilter, patientFilter]);

  if (isLoading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                    <CalendarDays className="mr-2 h-6 w-6" /> All Appointments
                </CardTitle>
                <CardDescription>
                    View, search, and filter all scheduled appointments.
                </CardDescription>
            </div>
            {/* Future: Button to schedule a generic appointment if needed */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patient or reason..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={patientFilter} onValueChange={(value) => setPatientFilter(value as string | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Appointment['status'] | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                    )}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Filter by Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                        setDateFilter(date);
                        setIsCalendarOpen(false);
                    }}
                    initialFocus
                />
                 <Button variant="ghost" size="sm" className="w-full" onClick={() => { setDateFilter(undefined); setIsCalendarOpen(false); }}>Clear Date</Button>
            </PopoverContent>
            </Popover>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.patientName}</TableCell>
                    <TableCell>{format(new Date(appt.dateTime), "PPpp")}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
                    <TableCell>
                        <Badge 
                            variant={appt.status === 'Scheduled' ? 'default' : (appt.status === 'Completed' ? 'secondary' : 'destructive')}
                            className={appt.status === 'Scheduled' ? 'bg-blue-500 hover:bg-blue-600' : appt.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                        >
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/patients/${appt.patientId}`}>
                          <Eye className="mr-1 h-4 w-4" /> View Patient
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No appointments found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
