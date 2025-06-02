
'use server';
/**
 * @fileOverview A Genkit flow to summarize a patient's medical history using an LLM.
 *
 * Exports:
 * - summarizePatientHistory: An asynchronous function that takes a patientId
 *   and returns a concise summary of their medical history.
 * - PatientIdInput: The Zod schema type for the input to the summarizePatientHistory function.
 * - PatientSummaryOutput: The Zod schema type for the output of the summarizePatientHistory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Input Schema for the flow
const PatientIdInputSchema = z.object({
  patientId: z.string().min(1, { message: "L'ID du patient ne peut pas être vide." }),
});
export type PatientIdInput = z.infer<typeof PatientIdInputSchema>;

// Output Schema for the flow
const PatientSummaryOutputSchema = z.object({
  summary: z.string().describe("Un résumé concis de l'historique médical et de l'état actuel du patient."),
});
export type PatientSummaryOutput = z.infer<typeof PatientSummaryOutputSchema>;

// Schemas for data passed to the prompt
const PatientDataForPromptSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string().describe("Date de naissance au format JJ MMMM YYYY"),
  service: z.string().optional().describe("Service médical du patient"),
});

const MedicalRecordForPromptSchema = z.object({
  consultationDate: z.string().describe("Date de consultation au format JJ MMMM YYYY à HH:mm"),
  motifConsultation: z.string().optional().default("Non spécifié"),
  symptomes: z.string().optional().default("Non spécifiés"),
  diagnostic: z.string().optional().default("Non spécifié"),
  traitementPrescrit: z.string().optional().default("Non spécifié"),
  issueConsultation: z.string().optional().default("Non spécifiée"),
  notesMedecin: z.string().optional().default("Aucune"),
});

const PatientHistoryPromptInputSchema = z.object({
  patient: PatientDataForPromptSchema,
  medicalHistory: z.array(MedicalRecordForPromptSchema),
});

// Define the Genkit Prompt
const patientSummaryPrompt = ai.definePrompt({
  name: 'patientSummaryPrompt',
  model: 'gemini-1.5-flash', // Updated to gemini-1.5-flash
  input: { schema: PatientHistoryPromptInputSchema },
  output: { schema: PatientSummaryOutputSchema },
  prompt: `Vous êtes un assistant médical IA chargé de résumer l'historique médical d'un patient pour un professionnel de santé. Soyez concis, précis et utilisez un langage médical approprié mais compréhensible. Le résumé doit être en français.

Informations du Patient :
Nom complet : {{patient.firstName}} {{patient.lastName}}
Date de naissance : {{patient.dob}}
{{#if patient.service}}Service : {{patient.service}}{{/if}}

Historique des consultations (les plus récentes peuvent apparaître en premier selon le tri des données fournies) :
{{#if medicalHistory.length}}
{{#each medicalHistory}}
---
Date de Consultation : {{consultationDate}}
Motif : {{motifConsultation}}
Symptômes rapportés : {{symptomes}}
Diagnostic : {{diagnostic}}
Traitement prescrit : {{traitementPrescrit}}
Issue de la consultation : {{issueConsultation}}
Notes du médecin : {{notesMedecin}}
{{/each}}
{{else}}
Aucun historique de consultation détaillé n'a été fourni pour ce patient.
{{/if}}
---

Objectif : Générer un résumé médical du patient. Mettez en évidence les diagnostics majeurs, les conditions chroniques, les traitements importants et l'évolution générale de l'état de santé. Si l'historique est vide ou peu informatif, indiquez-le.
Ne vous contentez pas de lister les consultations, mais synthétisez les informations clés.
`,
});

// Define the Genkit Flow
const summarizePatientHistoryFlow = ai.defineFlow(
  {
    name: 'summarizePatientHistoryFlow',
    inputSchema: PatientIdInputSchema,
    outputSchema: PatientSummaryOutputSchema,
  },
  async (input) => {
    const { patientId } = input;

    // Fetch patient data
    const patientDocRef = doc(db, "patients", patientId);
    const patientDocSnap = await getDoc(patientDocRef);

    if (!patientDocSnap.exists()) {
      throw new Error(`Patient avec ID ${patientId} non trouvé.`);
    }
    const patientData = patientDocSnap.data();
    const formattedPatientData = {
      id: patientDocSnap.id,
      firstName: patientData.firstName || "N/A",
      lastName: patientData.lastName || "N/A",
      dob: patientData.dob ? format(new Date(patientData.dob), 'dd MMMM yyyy', { locale: fr }) : "N/A",
      service: patientData.service || undefined,
    };

    // Fetch medical history
    const medicalHistoryQuery = query(
      collection(db, "dossiersMedicaux"),
      where("patientId", "==", patientId),
      orderBy("consultationDate", "desc") // Get most recent first
    );
    const medicalHistorySnapshot = await getDocs(medicalHistoryQuery);
    const formattedMedicalHistory = medicalHistorySnapshot.docs.map(docSnap => {
      const record = docSnap.data();
      return {
        consultationDate: record.consultationDate ? format(record.consultationDate.toDate(), 'dd MMMM yyyy \'à\' HH:mm', { locale: fr }) : "N/A",
        motifConsultation: record.motifConsultation || undefined,
        symptomes: record.symptomes || undefined,
        diagnostic: record.diagnostic || undefined,
        traitementPrescrit: record.traitementPrescrit || undefined,
        issueConsultation: record.issueConsultation || undefined,
        notesMedecin: record.notesMedecin || undefined,
      };
    });
    
    const promptInput = {
      patient: formattedPatientData,
      medicalHistory: formattedMedicalHistory,
    };

    const { output } = await patientSummaryPrompt(promptInput);

    if (!output) {
      throw new Error("La génération du résumé IA n'a pas produit de résultat.");
    }
    return output;
  }
);

/**
 * Generates a summary of a patient's medical history using an AI model.
 * This function serves as a wrapper around the Genkit flow.
 * @param input - The patient ID.
 * @returns A promise that resolves to a PatientSummaryOutput object.
 */
export async function summarizePatientHistory(input: PatientIdInput): Promise<PatientSummaryOutput> {
  const validationResult = PatientIdInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Validation échouée: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }
  return summarizePatientHistoryFlow(validationResult.data);
}
