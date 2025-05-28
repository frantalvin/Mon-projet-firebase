"use client";

import type { Patient } from "@/lib/types";
import { generatePatientSummary } from "@/ai/flows/generate-patient-summary";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientSummaryGeneratorProps {
  patient: Patient;
}

export function PatientSummaryGenerator({ patient }: PatientSummaryGeneratorProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await generatePatientSummary({ patientHistory: patient.medicalHistory });
      setSummary(result.summary);
    } catch (e) {
      console.error("Error generating summary:", e);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Patient Summary
        </CardTitle>
        <CardDescription>
          Generate a concise summary of the patient's medical history using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Full Medical History:</h4>
          <Textarea
            value={patient.medicalHistory || "No medical history provided."}
            readOnly
            className="min-h-[100px] bg-muted/50"
            aria-label="Patient's full medical history"
          />
        </div>
        <Button onClick={handleGenerateSummary} disabled={isLoading || !patient.medicalHistory} className="w-full md:w-auto">
          {isLoading ? "Generating Summary..." : "Generate Summary"}
        </Button>
        {isLoading && (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summary && !isLoading && (
          <div>
            <h4 className="font-semibold mb-1">Generated Summary:</h4>
            <Textarea
              value={summary}
              readOnly
              className="min-h-[100px]"
              aria-label="AI generated patient summary"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
