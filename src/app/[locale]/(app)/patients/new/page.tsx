
"use client";

import { PatientForm } from "@/components/patient-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";
import { useLocale } from "next-intl";

// TODO: Translate this page content using useTranslations
export default function NewPatientPage() {
  const { addPatient } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRegisterPatient = (data: any) => {
    setIsSubmitting(true);
    try {
      const newPatient = addPatient(data);
      toast({
        title: "Patient Registered", // TODO: Translate
        description: `${newPatient.name} has been successfully registered.`, // TODO: Translate
      });
      router.push(`/${locale}/patients/${newPatient.id}`);
    } catch (error) {
      toast({
        title: "Error", // TODO: Translate
        description: "Failed to register patient. Please try again.", // TODO: Translate
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Register New Patient</CardTitle> 
        <CardDescription>
          Fill in the details below to add a new patient to the system. 
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PatientForm onSubmit={handleRegisterPatient} isSubmitting={isSubmitting} />
      </CardContent>
    </Card>
  );
}
