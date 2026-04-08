'use server';
/**
 * @fileOverview An AI financial coach agent that analyzes spending habits and provides personalized insights and budgeting advice.
 *
 * - aiFinancialCoachInsights - A function that handles the financial coaching process.
 * - AiFinancialCoachInsightsInput - The input type for the aiFinancialCoachInsights function.
 * - AiFinancialCoachInsightsOutput - The return type for the aiFinancialCoachInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFinancialCoachInsightsInputSchema = z.object({
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense (e.g., Food, Transport, Utilities).'),
      amount: z.number().describe('The amount of the expense.'),
      date: z.string().describe('The date of the expense in YYYY-MM-DD format.'),
      note: z.string().optional().describe('An optional note or description for the expense.'),
    })
  ).describe('A list of user expenses.'),
  monthlyBudget: z.number().optional().describe('The user\'s total monthly budget.'),
  userGoals: z.string().optional().describe('A description of the user\'s financial goals.'),
});
export type AiFinancialCoachInsightsInput = z.infer<typeof AiFinancialCoachInsightsInputSchema>;

const AiFinancialCoachInsightsOutputSchema = z.object({
  insights: z.string().describe('General financial insights and observations.'),
  spendingAnalysis: z.string().describe('Detailed breakdown of spending by category and identification of potential savings areas.'),
  budgetingAdvice: z.string().describe('Actionable, personalized recommendations for managing money and achieving financial goals.'),
});
export type AiFinancialCoachInsightsOutput = z.infer<typeof AiFinancialCoachInsightsOutputSchema>;

export async function aiFinancialCoachInsights(input: AiFinancialCoachInsightsInput): Promise<AiFinancialCoachInsightsOutput> {
  return aiFinancialCoachInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFinancialCoachInsightsPrompt',
  input: {schema: AiFinancialCoachInsightsInputSchema},
  output: {schema: AiFinancialCoachInsightsOutputSchema},
  prompt: `You are an AI financial coach named TRACTION helping a beginner student.
Keep the answer very simple, warm, and easy to understand.
Do not use advanced finance words.
Each section should be about 4 to 5 short sentences.
Be encouraging and practical.
Use specific numbers from the data when helpful.
Explain the reason behind your advice in a simple way.
Make each section feel complete and useful, not too brief.

Here is the user's financial data:
Monthly Budget: {{{monthlyBudget}}}

User's Financial Goals: {{{userGoals}}}

Expenses:
{{#each expenses}}
  - Date: {{{date}}}, Category: {{{category}}}, Amount: {{{amount}}}, Note: {{{note}}}
{{/each}}

Please provide:
1.  **Financial Insights**: A fuller summary of the spending pattern.
2.  **Spending Analysis**: A clearer explanation of where most money is going, what stands out, and what it may mean.
3.  **Budgeting Advice**: A practical next step the student can follow today, with a simple reason and encouragement.

Present your output in a clear, structured JSON format matching the OutputSchema.`,
});

const aiFinancialCoachInsightsFlow = ai.defineFlow(
  {
    name: 'aiFinancialCoachInsightsFlow',
    inputSchema: AiFinancialCoachInsightsInputSchema,
    outputSchema: AiFinancialCoachInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
