'use server';

/**
 * @fileOverview Financial Insight Agent - provides insightful answers to user questions about their financial data.
 *
 * - financialInsightAgent - A function that handles user prompts related to financial data and provides tailored advice.
 * - FinancialInsightAgentInput - The input type for the financialInsightAgent function.
 * - FinancialInsightAgentOutput - The return type for the financialInsightAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInsightAgentInputSchema = z.object({
  query: z.string().describe('The user query about their financial data.'),
  financialData: z.string().describe('The user financial data in JSON format.'),
});
export type FinancialInsightAgentInput = z.infer<typeof FinancialInsightAgentInputSchema>;

const FinancialInsightAgentOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query based on their financial data.'),
});
export type FinancialInsightAgentOutput = z.infer<typeof FinancialInsightAgentOutputSchema>;

export async function financialInsightAgent(input: FinancialInsightAgentInput): Promise<FinancialInsightAgentOutput> {
  return financialInsightAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightAgentPrompt',
  input: {schema: FinancialInsightAgentInputSchema},
  output: {schema: FinancialInsightAgentOutputSchema},
  prompt: `You are a financial advisor. Use the user's financial data to answer their questions accurately and insightfully.

User Query: {{{query}}}

Financial Data: {{{financialData}}}

Answer:`,
});

const financialInsightAgentFlow = ai.defineFlow(
  {
    name: 'financialInsightAgentFlow',
    inputSchema: FinancialInsightAgentInputSchema,
    outputSchema: FinancialInsightAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
