
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

if (process.env.GOOGLE_API_KEY) {
  console.log('[genkit.ts] GOOGLE_API_KEY is set.');
} else {
  console.warn(
    '[genkit.ts] GOOGLE_API_KEY environment variable is NOT SET. AI features requiring Google AI models will not work. Please refer to src/ai/genkit.ts for instructions.'
  );
  // Depending on the desired behavior, you might throw an error here to halt
  // initialization if the API key is absolutely critical for the app to start.
  // For now, we'll just warn, allowing the app to run but with potentially non-functional AI parts.
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Explicitly passing the API key
    }),
  ],
  // As per Firebase Studio guidance, logLevel is not set here.
  // Flow state and trace stores are not enabled by default for this basic setup.
  // enableTracingAndStateStore: true, // Uncomment if you need to persist flow states and traces
});
