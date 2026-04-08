'use server';
/**
 * @fileOverview A Genkit flow for intelligently suggesting an expense category based on a description.
 *
 * - smartExpenseCategorization - A function that handles the expense categorization process.
 * - SmartExpenseCategorizationInput - The input type for the smartExpenseCategorization function.
 * - SmartExpenseCategorizationOutput - The return type for the smartExpenseCategorization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Groceries',
  'Travel',
  'Personal Care',
  'Insurance',
  'Investments',
  'Salary',
  'Other'
];

const SmartExpenseCategorizationInputSchema = z.object({
  description: z
    .string()
    .describe('A brief description of the expense.')
});
export type SmartExpenseCategorizationInput = z.infer<typeof SmartExpenseCategorizationInputSchema>;

const SmartExpenseCategorizationOutputSchema = z.object({
  category: z
    .string()
    .describe(
      `The most suitable category for the expense from the following list: ${EXPENSE_CATEGORIES.join(
        ', '
      )}.`
    )
});
export type SmartExpenseCategorizationOutput = z.infer<typeof SmartExpenseCategorizationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'smartExpenseCategorizationPrompt',
  input: {schema: SmartExpenseCategorizationInputSchema},
  output: {schema: SmartExpenseCategorizationOutputSchema},
  prompt: `You are an intelligent assistant for an expense tracker application.\nYour task is to analyze an expense description and suggest the most appropriate category from a predefined list.\n\nHere are the available categories:\n${EXPENSE_CATEGORIES.map(cat => `- ${cat}`).join('\n')}\n\nBased on the following expense description, choose *only one* category from the list that best fits. If none of the categories are a perfect match, choose 'Other'.\n\nExpense Description: {{{description}}}`
});

export async function smartExpenseCategorization(input: SmartExpenseCategorizationInput): Promise<SmartExpenseCategorizationOutput> {
  return smartExpenseCategorizationFlow(input);
}

const smartExpenseCategorizationFlow = ai.defineFlow(
  {
    name: 'smartExpenseCategorizationFlow',
    inputSchema: SmartExpenseCategorizationInputSchema,
    outputSchema: SmartExpenseCategorizationOutputSchema
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);