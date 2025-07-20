'use server';

/**
 * @fileOverview SMS Tracker Integration AI agent.
 *
 * - trackSmsTransactions - A function that handles the tracking of financial transactions from SMS messages.
 * - TrackSmsTransactionsInput - The input type for the trackSmsTransactions function.
 * - TrackSmsTransactionsOutput - The return type for the trackSmsTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrackSmsTransactionsInputSchema = z.object({
  smsContent: z.string().describe('The content of the SMS message to analyze.'),
});
export type TrackSmsTransactionsInput = z.infer<typeof TrackSmsTransactionsInputSchema>;

const TransactionCategorySchema = z.enum([
  'bank_transfer',
  'upi_payment',
  'auto_debit',
  'food',
  'travel',
  'sip',
  'rent',
  'other',
]);

const TrackSmsTransactionsOutputSchema = z.object({
  transactionDescription: z.string().describe('A description of the transaction.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
  transactionCategory: TransactionCategorySchema.describe(
    'The category of the transaction (bank_transfer, upi_payment, auto_debit, food, travel, sip, rent, other).'
  ),
});
export type TrackSmsTransactionsOutput = z.infer<typeof TrackSmsTransactionsOutputSchema>;

export async function trackSmsTransactions(input: TrackSmsTransactionsInput): Promise<TrackSmsTransactionsOutput> {
  return trackSmsTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trackSmsTransactionsPrompt',
  input: {schema: TrackSmsTransactionsInputSchema},
  output: {schema: TrackSmsTransactionsOutputSchema},
  prompt: `You are a financial transaction analyzer. You will receive the content of an SMS message related to a financial transaction.
Your goal is to extract the relevant information from the message and categorize the transaction.

SMS Content: {{{smsContent}}}

Based on the SMS content, please provide:
- A description of the transaction.
- The amount of the transaction.
- The category of the transaction (bank_transfer, upi_payment, auto_debit, food, travel, sip, rent, other).

Ensure the output is accurate and well-formatted.
`,
});

const trackSmsTransactionsFlow = ai.defineFlow(
  {
    name: 'trackSmsTransactionsFlow',
    inputSchema: TrackSmsTransactionsInputSchema,
    outputSchema: TrackSmsTransactionsOutputSchema,
  },
  async input => {
    // Fallback regex-based categorization
    let category = 'other';
    if (input.smsContent.toLowerCase().includes('upi')) {
      category = 'upi_payment';
    } else if (input.smsContent.toLowerCase().includes('debit')) {
      category = 'auto_debit';
    } else if (input.smsContent.toLowerCase().includes('transfer')) {
      category = 'bank_transfer';
    }

    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('AI analysis failed, falling back to regex categorization:', error);
      // If AI analysis fails, return a default output with regex-based category
      return {
        transactionDescription: 'Transaction from SMS (Regex Fallback)',
        transactionAmount: 0, // Default amount
        transactionCategory: category as typeof category,
      };
    }
  }
);
