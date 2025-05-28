
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

if (!process.env.GOOGLE_API_KEY) {
  console.warn(
    'GOOGLE_API_KEY environment variable is not set. AI features requiring Google AI models may not work. Please refer to src/ai/genkit.ts for instructions.'
  );
  // Depending on the desired behavior, you might throw an error here to halt
  // initialization if the API key is absolutely critical for the app to start.
  // For now, we'll just warn, allowing the app to run but with potentially non-functional AI parts.
  // throw new GenkitError({
  //   status: 'UNCONFIGURED',
  //   message:
  //     'GOOGLE_API_KEY environment variable is not set. Please configure it to use Google AI models. Refer to src/ai/genkit.ts.',
  // });
}

export const ai = genkit({
  plugins: [
    googleAI({
      // The apiKey is typically automatically picked up from the GOOGLE_API_KEY environment variable.
      // You can explicitly pass it here if needed: apiKey: process.env.GOOGLE_API_KEY
    }),
  ],
  // As per Firebase Studio guidance, logLevel is not set here.
  // Flow state and trace stores are not enabled by default for this basic setup.
  // enableTracingAndStateStore: true, // Uncomment if you need to persist flow states and traces
});
