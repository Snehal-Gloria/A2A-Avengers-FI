// src/ai/flows/carbon-impact-agent.ts
'use server';

/**
 * @fileOverview Analyzes user spending data to provide carbon footprint insights and suggests lower-carbon alternatives.
 *
 * - analyzeCarbonImpact - A function that analyzes spending data and suggests alternatives.
 * - CarbonImpactInput - The input type for the analyzeCarbonImpact function.
 * - CarbonImpactOutput - The return type for the analyzeCarbonImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CarbonImpactInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A JSON string containing the user spending data, including categories and amounts.'
    ),
  location: z
    .string()
    .optional()
    .describe('The user location to find local alternatives.'),
});
export type CarbonImpactInput = z.infer<typeof CarbonImpactInputSchema>;

const CarbonImpactOutputSchema = z.object({
  analysis: z.string().describe('Analysis of the carbon footprint of the user spending.'),
  suggestions: z
    .string()
    .describe('Suggestions for lower-carbon alternatives based on spending data.'),
});
export type CarbonImpactOutput = z.infer<typeof CarbonImpactOutputSchema>;

export async function analyzeCarbonImpact(
  input: CarbonImpactInput
): Promise<CarbonImpactOutput> {
  return carbonImpactFlow(input);
}

const carbonImpactPrompt = ai.definePrompt({
  name: 'carbonImpactPrompt',
  input: {schema: CarbonImpactInputSchema},
  output: {schema: CarbonImpactOutputSchema},
  prompt: `You are an AI assistant designed to analyze spending data and provide insights into the carbon footprint associated with user purchases.

  Analyze the following spending data:
  {{spendingData}}

  Based on the spending data, provide an analysis of the carbon footprint, and suggest lower-carbon alternatives. If the user provided a location, suggest specific local alternatives such as vegetarian restaurants or local gardens.
  Location: {{location}}

  Format your output clearly, starting with an analysis, followed by specific and actionable suggestions for reducing carbon footprint.
  Ensure suggestions are practical and consider the user's financial habits.
`,
});

const carbonImpactFlow = ai.defineFlow(
  {
    name: 'carbonImpactFlow',
    inputSchema: CarbonImpactInputSchema,
    outputSchema: CarbonImpactOutputSchema,
  },
  async input => {
    const {output} = await carbonImpactPrompt(input);
    return output!;
  }
);







