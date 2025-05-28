
// src/app/(app)/statistics/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assurez-vous que Select est disponible
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

// Placeholder data for the chart
const diseaseData = [
  { name: 'Grippe', count: 120 },
  { name: 'Rhume', count: 90 },
  { name: 'Gastro', count: 75 },
  { name: 'Angine', count: 60 },
  { name: 'Autre', count: 150 },
];

export default function StatisticsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-semibold">Statistiques et Visualisations</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Affinez les données affichées dans les graphiques.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="filter-month" className="block text-sm font-medium text-muted-foreground mb-1">Mois</label>
            <Select>
              <SelectTrigger id="filter-month">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">Janvier</SelectItem>
                <SelectItem value="feb">Février</SelectItem>
                <SelectItem value="mar">Mars</SelectItem>
                {/* Ajouter d'autres mois */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-region" className="block text-sm font-medium text-muted-foreground mb-1">Région</label>
             <Select>
              <SelectTrigger id="filter-region">
                <SelectValue placeholder="Sélectionner une région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north">Nord</SelectItem>
                <SelectItem value="south">Sud</SelectItem>
                <SelectItem value="center">Centre</SelectItem>
                {/* Ajouter d'autres régions */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-age" className="block text-sm font-medium text-muted-foreground mb-1">Tranche d'âge</label>
            <Select>
              <SelectTrigger id="filter-age">
                <SelectValue placeholder="Sélectionner une tranche d'âge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-18">0-18 ans</SelectItem>
                <SelectItem value="19-40">19-40 ans</SelectItem>
                <SelectItem value="41-65">41-65 ans</SelectItem>
                <SelectItem value="65+">65+ ans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maladies les plus fréquentes</CardTitle>
          <CardDescription>Distribution des maladies diagnostiquées.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diseaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Nombre de cas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export des Données</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Option d'export des données (PDF, image) sera implémentée ici.</p>
          <Button variant="outline" disabled>Exporter en PDF (Bientôt)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
