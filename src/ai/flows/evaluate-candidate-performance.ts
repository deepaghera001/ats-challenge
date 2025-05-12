// src/ai/flows/evaluate-candidate-performance.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating candidate performance during an interview.
 *
 * - evaluateCandidatePerformance - A function that evaluates a candidate's interview performance based on their answers and response times.
 * - EvaluateCandidatePerformanceInput - The input type for the evaluateCandidatePerformance function.
 * - EvaluateCandidatePerformanceOutput - The return type for the evaluateCandidatePerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCandidatePerformanceInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  candidateCv: z.string().describe('The candidate\u2019s CV.'),
  interviewAnswers: z.array(
    z.object({
      question: z.string().describe('The interview question.'),
      answer: z.string().describe('The candidate\u2019s answer to the question.'),
      responseTimeSeconds: z.number().describe('The candidate\u2019s response time in seconds.'),
    })
  ).describe('An array of interview questions, answers, and response times.'),
});
export type EvaluateCandidatePerformanceInput = z.infer<typeof EvaluateCandidatePerformanceInputSchema>;

const EvaluateCandidatePerformanceOutputSchema = z.object({
  overallScore: z.number().describe('The overall performance score of the candidate (0-100).'),
  strengths: z.string().describe('A summary of the candidate\u2019s strengths based on their answers.'),
  weaknesses: z.string().describe('A summary of the candidate\u2019s weaknesses based on their answers.'),
  areasForImprovement: z.string().describe('Suggested areas for improvement for the candidate.'),
  detailedFeedback: z.string().describe('Detailed feedback on each answer provided by the candidate.'),
});
export type EvaluateCandidatePerformanceOutput = z.infer<typeof EvaluateCandidatePerformanceOutputSchema>;

export async function evaluateCandidatePerformance(input: EvaluateCandidatePerformanceInput): Promise<EvaluateCandidatePerformanceOutput> {
  return evaluateCandidatePerformanceFlow(input);
}

const evaluateCandidatePerformancePrompt = ai.definePrompt({
  name: 'evaluateCandidatePerformancePrompt',
  input: {schema: EvaluateCandidatePerformanceInputSchema},
  output: {schema: EvaluateCandidatePerformanceOutputSchema},
  prompt: `You are an expert recruiter evaluating candidate performance based on their interview answers and response times.

  Job Description: {{{jobDescription}}}
  Candidate CV: {{{candidateCv}}}
  Interview Answers:
  {{#each interviewAnswers}}
  Question: {{{this.question}}}
  Answer: {{{this.answer}}}
  Response Time (seconds): {{{this.responseTimeSeconds}}}
  {{/each}}

  Evaluate the candidate based on the following criteria:
  - Answer Quality: How well the candidate addressed the question, clarity, relevance, and depth of the answer.
  - Response Time: How quickly the candidate responded to the question. Shorter response times are generally better, but consider the complexity of the question.

  Provide the following in your evaluation:
  - Overall Score (0-100): A numerical score representing the candidate\u2019s overall performance.
  - Strengths: A summary of the candidate\u2019s strengths based on their answers.
  - Weaknesses: A summary of the candidate\u2019s weaknesses based on their answers.
  - Areas for Improvement: Suggested areas for improvement for the candidate.
  - Detailed Feedback: Detailed feedback on each answer provided by the candidate.
  Be concise.
  `,
});

const evaluateCandidatePerformanceFlow = ai.defineFlow(
  {
    name: 'evaluateCandidatePerformanceFlow',
    inputSchema: EvaluateCandidatePerformanceInputSchema,
    outputSchema: EvaluateCandidatePerformanceOutputSchema,
  },
  async input => {
    const {output} = await evaluateCandidatePerformancePrompt(input);
    return output!;
  }
);
