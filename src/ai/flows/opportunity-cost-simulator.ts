'use server';

/**
 * @fileOverview A flow that simulates the opportunity cost of different spending decisions.
 *
 * - opportunityCostSimulator - A function that simulates the opportunity cost of different spending decisions.
 * - OpportunityCostSimulatorInput - The input type for the opportunityCostSimulator function.
 * - OpportunityCostSimulatorOutput - The return type for the opportunityCostSimulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OpportunityCostSimulatorInputSchema = z.object({
  spendingDecision: z
    .string()
    .describe(
      'The spending decision to simulate, e.g., increasing SIP contributions or renting a more expensive apartment.'
    ),
  currentSavings: z
    .number()
    .describe('The amount of savings in INR the user has.'),
  investmentReturnRate: z
    .number()
    .describe(
      'The estimated annual investment return rate as a decimal (e.g., 0.05 for 5%).'
    ),
  simulationYears: z
    .number()
    .describe('The number of years to simulate the financial outcome over.'),
});
export type OpportunityCostSimulatorInput = z.infer<
  typeof OpportunityCostSimulatorInputSchema
>;

const OpportunityCostSimulatorOutputSchema = z.object({
  projectedSavings: z
    .number()
    .describe(
      'The projected savings after the specified number of years, taking into account the spending decision and investment return rate.'
    ),
  opportunityCost: z
    .number()
    .describe(
      'The difference between the projected savings with and without the spending decision.'
    ),
  insights: z
    .string()
    .describe(
      'A summary of the financial impact of the spending decision, including potential benefits and drawbacks.'
    ),
});
export type OpportunityCostSimulatorOutput = z.infer<
  typeof OpportunityCostSimulatorOutputSchema
>;

export async function opportunityCostSimulator(
  input: OpportunityCostSimulatorInput
): Promise<OpportunityCostSimulatorOutput> {
  return opportunityCostSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'opportunityCostSimulatorPrompt',
  input: {schema: OpportunityCostSimulatorInputSchema},
  output: {schema: OpportunityCostSimulatorOutputSchema},
  prompt: `You are a financial advisor helping users simulate the potential financial outcomes of different spending decisions.

  Based on the user's spending decision, current savings, investment return rate, and simulation years, calculate the projected savings and opportunity cost.

  Provide a summary of the financial impact of the spending decision, including potential benefits and drawbacks, to help the user make informed decisions about their finances.

  Spending Decision: {{{spendingDecision}}}
Savings (INR): {{{currentSavings}}}
Investment Return Rate: {{{investmentReturnRate}}}
Simulation Years: {{{simulationYears}}}

  Output the projected savings, opportunity cost, and insights in a JSON format. Be concise with your answer. Don't include any personally identifying information.
  `,
});

const opportunityCostSimulatorFlow = ai.defineFlow(
  {
    name: 'opportunityCostSimulatorFlow',
    inputSchema: OpportunityCostSimulatorInputSchema,
    outputSchema: OpportunityCostSimulatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
