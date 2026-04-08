'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language into structured task and reminder data.
 *
 * - naturalLanguageTaskCreation - A function that handles the natural language task creation process.
 * - NaturalLanguageTaskInput - The input type for the naturalLanguageTaskCreation function.
 * - NaturalLanguageTaskOutput - The return type for the naturalLanguageTaskCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageTaskInputSchema = z.object({
  naturalLanguageInput: z
    .string()
    .describe('The natural language description of the task or reminder.'),
});
export type NaturalLanguageTaskInput = z.infer<
  typeof NaturalLanguageTaskInputSchema
>;

const NaturalLanguageTaskOutputSchema = z.object({
  taskName: z.string().describe('The name or title of the task.'),
  description: z
    .string()
    .optional()
    .describe('A more detailed description of the task, if available.'),
  dueDate: z
    .string()
    .optional()
    .describe('The due date of the task in YYYY-MM-DD format, if specified.'),
  dueTime: z
    .string()
    .optional()
    .describe('The due time of the task in HH:MM (24-hour) format, if specified.'),
  isReminder: z
    .boolean()
    .describe('True if the input indicates a reminder, false otherwise.'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('The priority of the task.'),
});
export type NaturalLanguageTaskOutput = z.infer<
  typeof NaturalLanguageTaskOutputSchema
>;

export async function naturalLanguageTaskCreation(
  input: NaturalLanguageTaskInput
): Promise<NaturalLanguageTaskOutput> {
  return naturalLanguageTaskCreationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageTaskPrompt',
  input: {schema: NaturalLanguageTaskInputSchema},
  output: {schema: NaturalLanguageTaskOutputSchema},
  prompt: `You are an AI assistant specialized in parsing natural language task descriptions.
Your goal is to extract key information and format it into a structured JSON object.

Instructions:
- Analyze the 'naturalLanguageInput' to identify the task name, description, due date, due time, whether it's a reminder, and its priority.
- For 'dueDate', use the YYYY-MM-DD format. If no year is specified, assume the current year. If no date is specified, leave it null.
- For 'dueTime', use the HH:MM (24-hour) format. If no time is specified, leave it null.
- Determine 'isReminder' based on keywords like "remind me", "reminder", etc.
- For 'priority', categorize it as 'low', 'medium', or 'high' if implied. Otherwise, leave it null.
- If no specific task name is clear, try to infer one or use a generic descriptor based on the input.

Natural Language Input: {{{naturalLanguageInput}}}`,
});

const naturalLanguageTaskCreationFlow = ai.defineFlow(
  {
    name: 'naturalLanguageTaskCreationFlow',
    inputSchema: NaturalLanguageTaskInputSchema,
    outputSchema: NaturalLanguageTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to parse natural language input into a task.');
    }
    return output;
  }
);
