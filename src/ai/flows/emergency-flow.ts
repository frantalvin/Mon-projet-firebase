
'use server';
/**
 * @fileOverview AI flow for analyzing and prioritizing emergency cases.
 *
 * This module defines an AI flow using Genkit to assess the severity of
 * medical emergencies based on a textual description.
 *
 * Exports:
 * - analyzeEmergencyCase: An asynchronous function that takes an emergency description
 *   and returns an analysis including priority, reasoning, and recommended actions.
 * - EmergencyCaseInput: The Zod schema type for the input to the analysis function.
 * - EmergencyCaseAnalysis: The Zod schema type for the output of the analysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; // Genkit re-exports Zod for convenience

// Input Schema for the emergency analysis
const EmergencyCaseInputSchema = z.object({
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." })
    .describe('A textual description of the emergency case provided by medical personnel.'),
});
export type EmergencyCaseInput = z.infer<typeof EmergencyCaseInputSchema>;

// Output Schema for the emergency analysis, matching dashboard expectations
const EmergencyCaseAnalysisSchema = z.object({
  priority: z.string().describe('The assessed priority level of the emergency (e.g., "Élevée", "Moyenne", "Faible").'),
  reasoning: z.string().describe('The reasoning behind the assigned priority level.'),
  recommendedActions: z.array(z.string()).describe('A list of recommended immediate actions for medical personnel.'),
});
export type EmergencyCaseAnalysis = z.infer<typeof EmergencyCaseAnalysisSchema>;

/**
 * Analyzes an emergency case description using an AI model.
 * This function serves as a wrapper around the Genkit flow.
 * @param input - The emergency case description.
 * @returns A promise that resolves to an EmergencyCaseAnalysis object.
 */
export async function analyzeEmergencyCase(input: EmergencyCaseInput): Promise<EmergencyCaseAnalysis> {
  // Validate input using Zod schema before calling the flow
  const validationResult = EmergencyCaseInputSchema.safeParse(input);
  if (!validationResult.success) {
    // Handle validation errors, e.g., by throwing an error or returning a specific structure
    console.error("[emergency-flow.ts] Invalid input for emergency analysis:", validationResult.error.format());
    // For simplicity, throwing an error. In a real app, you might return a user-friendly error.
    throw new Error(`Validation échouée: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }
  return emergencyCaseAnalysisFlow(validationResult.data);
}

// Define the Genkit Prompt for emergency analysis
const emergencyPrompt = ai.definePrompt({
  name: 'emergencyAnalysisPrompt',
  model: 'gemini-pro', // Using standard 'gemini-pro' for baseline testing
  input: { schema: EmergencyCaseInputSchema },
  output: { schema: EmergencyCaseAnalysisSchema },
  prompt: `Vous êtes un assistant IA pour une clinique médicale, spécialisé dans la priorisation des cas d'urgence.
Analysez la description du cas d'urgence suivante fournie par le personnel médical.
En fonction de la description, déterminez le niveau de priorité (par exemple, "Élevée", "Moyenne", "Faible"), fournissez un raisonnement clair pour cette priorité, et listez quelques actions concrètes recommandées.
Répondez en français pour le niveau de priorité, la justification et les actions recommandées. Assurez-vous que votre raisonnement et vos actions sont clairs et concis.

Description du cas : {{{description}}}
`,
});

// Define the Genkit Flow for emergency case analysis
const emergencyCaseAnalysisFlow = ai.defineFlow(
  {
    name: 'emergencyCaseAnalysisFlow',
    inputSchema: EmergencyCaseInputSchema,
    outputSchema: EmergencyCaseAnalysisSchema,
  },
  async (input) => {
    console.log('[emergency-flow.ts] emergencyCaseAnalysisFlow: Received input:', input);
    
    // Log the model name being used by the prompt
    // The model name is taken from the emergencyPrompt definition
    const modelNameToUse = (emergencyPrompt as any).config?.model?.name || 'gemini-pro'; // Attempt to get model name, default if not found
    console.log(`[emergency-flow.ts] emergencyCaseAnalysisFlow: Attempting to call emergencyPrompt configured with model: '${modelNameToUse}'`);

    const { output, usage } = await emergencyPrompt(input); 

    if (!output) {
      console.error('[emergency-flow.ts] emergencyCaseAnalysisFlow: AI analysis failed to produce an output.');
      throw new Error("L'analyse IA n'a pas réussi à produire un résultat.");
    }
    console.log('[emergency-flow.ts] emergencyCaseAnalysisFlow: AI analysis successful. Usage:', usage);
    return output;
  }
);
