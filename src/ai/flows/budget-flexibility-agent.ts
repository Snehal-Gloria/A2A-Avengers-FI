// budget-flexibility-agent.ts
'use server';

/**
 * @fileOverview Provides suggestions for adjusting the user's budget.
 *
 * - budgetFlexibilityAgent - A function that provides budget adjustment suggestions.
 * - BudgetFlexibilityInput - The input type for the budgetFlexibilityAgent function.
 * - BudgetFlexibilityOutput - The return type for the budgetFlexibilityAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetFlexibilityInputSchema = z.object({
  currentSpending: z
    .record(z.number())
    .describe('A map of spending categories to amounts spent.'),
  financialGoals: z.string().describe('The user’s financial goals.'),
  income: z.number().describe('The user’s monthly income.'),
  savings: z.number().describe('The user’s current savings.'),
});
export type BudgetFlexibilityInput = z.infer<typeof BudgetFlexibilityInputSchema>;

const BudgetFlexibilityOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggestions for adjusting the budget.'),
});
export type BudgetFlexibilityOutput = z.infer<typeof BudgetFlexibilityOutputSchema>;

export async function budgetFlexibilityAgent(
  input: BudgetFlexibilityInput
): Promise<BudgetFlexibilityOutput> {
  return budgetFlexibilityAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetFlexibilityPrompt',
  input: {schema: BudgetFlexibilityInputSchema},
  output: {schema: BudgetFlexibilityOutputSchema},
  prompt: `You are a personal finance advisor. Given the user's current spending habits, their financial goals, income, and savings, provide a list of suggestions for adjusting their budget to better meet their goals.

User's Financial Goals: {{{financialGoals}}}

Current Spending:
{{#each currentSpending}}  {{@key}}: {{{this}}}
{{/each}}

Income: {{{income}}}
Savings: {{{savings}}}

Suggestions:`,
});

const budgetFlexibilityAgentFlow = ai.defineFlow(
  {
    name: 'budgetFlexibilityAgentFlow',
    inputSchema: BudgetFlexibilityInputSchema,
    outputSchema: BudgetFlexibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
