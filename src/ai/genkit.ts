
/**
 * @fileOverview Initializes and configures the Genkit AI instance.
 * This file sets up the core AI functionality using Genkit and the Google AI plugin.
 * It exports a configured 'ai' object that is used throughout the application
 * to define and run AI flows, prompts, and models.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GenkitError } from 'genkit/error';

// IMPORTANT: GOOGLE_API_KEY environment variable must be set for Google AI models to work.
// You can set this in your .env file in the root of the project:
// GOOGLE_API_KEY=your_api_key_here
//
// For local development, ensure the .env file is present.
// For deployment (e.g., Firebase App Hosting), configure this environment variable
// in your backend settings.

const apiKeyFromEnv = process.env.GOOGLE_API_KEY;

if (apiKeyFromEnv && apiKeyFromEnv.trim() !== '') {
  console.log(`[genkit.ts] GOOGLE_API_KEY IS SET in environment. Length: ${apiKeyFromEnv.length}. Initial characters: ${apiKeyFromEnv.substring(0, 5)}...`);
} else {
  console.error( // Changed to console.error for higher visibility
    '[genkit.ts] CRITICAL: GOOGLE_API_KEY environment variable is NOT SET or is empty. AI features requiring Google AI models will not work. Please create a .env file in the project root and add GOOGLE_API_KEY=your_api_key_here, then restart the server.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKeyFromEnv || undefined, // Pass undefined if not set, so plugin might use other auth methods or error clearly
    }),
  ],
  // As per Firebase Studio guidance, logLevel is not set here.
  // Flow state and trace stores are not enabled by default for this basic setup.
  // enableTracingAndStateStore: true, // Uncomment if you need to persist flow states and traces
});
