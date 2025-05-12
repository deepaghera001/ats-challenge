'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating follow-up questions based on a candidate's answer.
 *
 * The flow takes the job description, CV, previous question, and candidate's answer as input,
 * and returns a follow-up question or the next question from the original list.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpQuestionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description for the position being interviewed for.'),
  cv: z.string().describe('The candidate\'s CV.'),
  previousQuestion: z.string().describe('The previous question asked to the candidate.'),
  candidateAnswer: z.string().describe('The candidate\'s answer to the previous question.'),
  originalQuestions: z.array(z.string()).describe('The original list of interview questions.'),
  currentQuestionIndex: z.number().describe('The index of the current question in the original list.'),
});

export type GenerateFollowUpQuestionInput = z.infer<
  typeof GenerateFollowUpQuestionInputSchema
>;

const GenerateFollowUpQuestionOutputSchema = z.object({
  shouldAskFollowUp: z
    .boolean()
    .describe('Whether a follow-up question should be asked based on the candidate\'s answer.'),
  followUpQuestion: z
    .string()
    .optional()
    .describe('The follow-up question to ask, if shouldAskFollowUp is true.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the decision to ask a follow-up question or move to the next question.'),
});

export type GenerateFollowUpQuestionOutput = z.infer<
  typeof GenerateFollowUpQuestionOutputSchema
>;

export async function generateFollowUpQuestion(
  input: GenerateFollowUpQuestionInput
): Promise<GenerateFollowUpQuestionOutput> {
  return generateFollowUpQuestionFlow(input);
}

const generateFollowUpQuestionPrompt = ai.definePrompt({
  name: 'generateFollowUpQuestionPrompt',
  input: {schema: GenerateFollowUpQuestionInputSchema},
  output: {schema: GenerateFollowUpQuestionOutputSchema},
  prompt: `You are an expert recruiter conducting an interview. Based on the candidate's answer to the previous question, 
  determine if a follow-up question is needed to get more clarity or depth.

Job Description: {{{jobDescription}}}

CV: {{{cv}}}

Previous Question: {{{previousQuestion}}}

Candidate's Answer: {{{candidateAnswer}}}

Original Questions: {{{originalQuestions}}}

Current Question Index: {{{currentQuestionIndex}}}

Analyze the candidate's answer and determine if:
1. The answer is complete and satisfactory, and we should move to the next question in the original list.
2. The answer needs clarification, more depth, or contains interesting points that warrant a follow-up question.

If a follow-up is needed, generate a relevant follow-up question that probes deeper into the candidate's experience, skills, or thought process.

Output your decision as a JSON object with the following fields:
- shouldAskFollowUp: boolean indicating whether to ask a follow-up question
- followUpQuestion: the follow-up question to ask (only if shouldAskFollowUp is true)
- reasoning: brief explanation of your decision
`,
});

const generateFollowUpQuestionFlow = ai.defineFlow(
  {
    name: 'generateFollowUpQuestionFlow',
    inputSchema: GenerateFollowUpQuestionInputSchema,
    outputSchema: GenerateFollowUpQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateFollowUpQuestionPrompt(input);
    return output!;
  }
);