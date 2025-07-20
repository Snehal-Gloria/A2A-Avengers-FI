'use server';
/**
 * @fileOverview A location-aware spending recommender AI agent.
 *
 * - recommendSpendingOptions - A function that handles the spending options recommendation process.
 * - RecommendSpendingOptionsInput - The input type for the recommendSpendingOptions function.
 * - RecommendSpendingOptionsOutput - The return type for the recommendSpendingOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSpendingOptionsInputSchema = z.object({
  location: z
    .string()
    .describe('The current location of the user (e.g., city, address).'),
  spendingCategory: z
    .string()
    .describe('The category of spending (e.g., food, shopping, entertainment).'),
  preferences: z
    .string()
    .optional()
    .describe('Optional user preferences or keywords (e.g., sustainable, cheap, organic).'),
});
export type RecommendSpendingOptionsInput = z.infer<
  typeof RecommendSpendingOptionsInputSchema
>;

const RecommendSpendingOptionsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string().describe('The name of the recommended place.'),
      description: z.string().describe('A short description of the place.'),
      address: z.string().describe('The address of the place.'),
      sustainabilityScore: z
        .number()
        .optional()
        .describe('An optional sustainability score for the place (0-100).'),
      carbonImpact: z
        .string()
        .optional()
        .describe('The carbon impact of this restaurant.'),
    })
  ),
});
export type RecommendSpendingOptionsOutput = z.infer<
  typeof RecommendSpendingOptionsOutputSchema
>;

export async function recommendSpendingOptions(
  input: RecommendSpendingOptionsInput
): Promise<RecommendSpendingOptionsOutput> {
  return recommendSpendingOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSpendingOptionsPrompt',
  input: {schema: RecommendSpendingOptionsInputSchema},
  output: {schema: RecommendSpendingOptionsOutputSchema},
  prompt: `You are a helpful assistant that provides spending recommendations based on the user's location and preferences.

  The user is currently in: {{{location}}}.
  They are looking for recommendations in the following category: {{{spendingCategory}}}.
  Their preferences are: {{{preferences}}}.

  Recommend a few places to go, including their address, a short description, and a sustainability score if available.
  If this is a restaurant, include a carbon impact assessment.

  Format your response as a JSON object that adheres to the following schema: ${JSON.stringify(
    RecommendSpendingOptionsOutputSchema.shape
  )}`,
});

const recommendSpendingOptionsFlow = ai.defineFlow(
  {
    name: 'recommendSpendingOptionsFlow',
    inputSchema: RecommendSpendingOptionsInputSchema,
    outputSchema: RecommendSpendingOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
