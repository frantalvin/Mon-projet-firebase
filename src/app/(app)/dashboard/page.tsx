
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useState, useEffect } from "react";
import type { EmergencyCaseAnalysis, EmergencyCaseInput } from "@/ai/flows/emergency-flow";
import { analyzeEmergencyCase } from "@/ai/flows/emergency-flow"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Placeholder data for appointments chart
const weeklyAppointmentsData = [
  { day: "Lun", appointments: 4 },
  { day: "Mar", appointments: 3 },
  { day: "Mer", appointments: 5 },
  { day: "Jeu", appointments: 2 },
  { day: "Ven", appointments: 6 },
  { day: "Sam", appointments: 1 },
  { day: "Dim", appointments: 0 },
];

export default function DashboardPage() {
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [emergencyAnalysis, setEmergencyAnalysis] = useState<EmergencyCaseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activePatients, setActivePatients] = useState<number | null>(null);
  const [appointmentsToday, setAppointmentsToday] = useState<number | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setActivePatients(125); // Placeholder
    setAppointmentsToday(8); // Placeholder
  }, []);

  const handleAnalyzeEmergency = async () => {
    if (!emergencyDescription.trim()) {
      setAnalysisError("Veuillez décrire le cas d'urgence.");
      return;
    }
    setIsAnalyzing(true);
    setEmergencyAnalysis(null);
    setAnalysisError(null);
    try {
      const result = await analyzeEmergencyCase({ description: emergencyDescription });
      setEmergencyAnalysis(result);
    } catch (error: any) {
      console.error("Error analyzing emergency case:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de l'analyse.";
      setAnalysisError(`Erreur d'analyse : ${errorMessage}`);
      // Optionally, set a placeholder error analysis for UI consistency
      setEmergencyAnalysis({
        priority: "Erreur",
        reasoning: `L'analyse a échoué: ${errorMessage}`,
        recommendedActions: ["Vérifier la console pour les détails techniques."]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-semibold">Tableau de Bord</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patients Actifs</CardTitle>
            <CardDescription>Nombre total de patients actifs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{activePatients !== null ? activePatients : "Chargement..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
            <CardDescription>Nombre de rendez-vous prévus aujourd'hui.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{appointmentsToday !== null ? appointmentsToday : "Chargement..."}</p>
          </CardContent>
        </Card>
         <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button>Nouveau Patient</Button>
            <Button variant="outline">Nouveau Rendez-vous</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Rendez-vous Hebdomadaires</CardTitle>
          <CardDescription>Aperçu des rendez-vous pour la semaine en cours.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAppointmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="hsl(var(--primary))" name="Rendez-vous" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priorisation des Urgences (IA)</CardTitle>
          <CardDescription>
            Décrivez un cas d'urgence pour obtenir une priorisation et des recommandations basées sur l'IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency-description">Description du cas d'urgence</Label>
            <Textarea
              id="emergency-description"
              placeholder="Ex: Patient de 45 ans, douleur thoracique aiguë irradiant vers le bras gauche, essoufflement..."
              value={emergencyDescription}
              onChange={(e) => setEmergencyDescription(e.target.value)}
              rows={4}
              disabled={isAnalyzing}
            />
          </div>
          <Button onClick={handleAnalyzeEmergency} disabled={isAnalyzing || !emergencyDescription.trim()}>
            {isAnalyzing ? "Analyse en cours..." : "Analyser l'Urgence"}
          </Button>
          
          {analysisError && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur d'Analyse</AlertTitle>
              <AlertDescription>
                {analysisError}
              </AlertDescription>
            </Alert>
          )}

          {emergencyAnalysis && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Résultat de l'Analyse IA :</h3>
              <p><strong>Priorité :</strong> <span className={
                emergencyAnalysis.priority === "Élevée" ? "text-destructive font-bold" : 
                emergencyAnalysis.priority === "Moyenne" ? "text-yellow-600 font-bold" : 
                emergencyAnalysis.priority === "Faible" ? "text-green-600 font-bold" : ""
              }>{emergencyAnalysis.priority}</span></p>
              <p><strong>Justification :</strong> {emergencyAnalysis.reasoning}</p>
              <div>
                <strong>Actions Recommandées :</strong>
                <ul className="list-disc list-inside space-y-1">
                  {emergencyAnalysis.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
