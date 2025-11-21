'use server';
/**
 * @fileOverview Genkit AI configuration.
 *
 * This file sets up and newup the Genkit AI instance for the application,
 * ensuring it's ready for use in server-side Next.js environments.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// If your logger requires explicit import, else remove this
// import { logger } from 'genkit/logging';

// Determine environment
const isDev = process.env.NODE_ENV === 'development';

// ⚠️ logger.setLevel does not exist! Remove these lines:
//// if (isDev) {
////   logger.setLevel('debug');
//// } else {
////   logger.setLevel('info');
//// }

// Configure Genkit
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  // ⚠️ There is NO 'enableTracingAndMetrics' property in GenkitOptions! Remove this line.
  //// enableTracingAndMetrics: isDev,
});
