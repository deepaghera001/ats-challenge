// use server'
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating interview questions based on a job description and a candidate's CV.
 *
 * The flow takes a job description and CV as input, and returns a list of interview questions.
 *
 * @interface GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * @interface GenerateInterviewQuestionsOutput - The output type for the generateInterviewQuestions function.
 * @function generateInterviewQuestions - The function to generate interview questions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description for the position being interviewed for.'),
  cv: z.string().describe('The candidate\u2019s CV.'),
});

export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of interview questions tailored to the job description and CV.'),
});

export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const generateInterviewQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert recruiter. Generate interview questions based on the job description and CV provided.

Job Description: {{{jobDescription}}}

CV: {{{cv}}}

Consider the skills and experience outlined in the CV in relation to the job description. Tailor the questions to assess the candidate's suitability for the role.

Output the interview questions as a JSON array of strings.
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewQuestionsPrompt(input);
    return output!;
  }
);
