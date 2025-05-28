"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Search, Eye } from "lucide-react";
import { format } from "date-fns";

export default function PatientsPage() {
  const { patients, searchPatients, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = useMemo(() => {
    return searchPatients(searchTerm);
  }, [searchPatients, searchTerm, patients]); // Added patients to dependency array

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold">Patient Records</CardTitle>
          <CardDescription>
            Browse, search, and manage patient information.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{format(new Date(patient.dob), "PP")}</TableCell>
                    <TableCell>{patient.contact}</TableCell>
                    <TableCell>{format(new Date(patient.registrationDate), "PP")}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/patients/${patient.id}`}>
                          <Eye className="mr-1 h-4 w-4" /> View
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
            No patients found.
            {searchTerm && " Try adjusting your search."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
