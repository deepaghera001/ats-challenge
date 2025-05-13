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
  technicalAcumen: z.number().describe('Technical skills assessment score (0-100)'),
  communicationSkills: z.number().describe('Communication ability score (0-100)'),
  responsivenessAgility: z.number().describe('Response quality and speed score (0-100)'),
  problemSolvingAdaptability: z.number().describe('Problem-solving capability score (0-100)'),
  culturalFitSoftSkills: z.number().describe('Cultural alignment and soft skills score (0-100)'),
  responseTimeMetrics: z.object({
    average: z.number().describe('Average response time in seconds'),
    min: z.number().describe('Fastest response time in seconds'),
    max: z.number().describe('Slowest response time in seconds'),
    totalQuestions: z.number().describe('Total number of questions answered')
  }).describe('Detailed response time metrics'),
  strengths: z.string().describe('A summary of the candidate\u2019s strengths based on their answers.'),
  weaknesses: z.string().describe('A summary of the candidate\u2019s weaknesses based on their answers.'),
  areasForImprovement: z.string().describe('Suggested areas for improvement for the candidate.'),
  detailedFeedback: z.string().describe('Detailed feedback on each answer provided by the candidate.'),
});
export type EvaluateCandidatePerformanceOutput = z.infer<typeof EvaluateCandidatePerformanceOutputSchema>;

export async function evaluateCandidatePerformance(input: EvaluateCandidatePerformanceInput): Promise<EvaluateCandidatePerformanceOutput> {
  return evaluateCandidatePerformanceFlow(input);
}

const EvaluateCandidatePerformancePromptInputSchema = EvaluateCandidatePerformanceInputSchema.extend({
  responseTimeMetrics: z.object({
    average: z.number(),
    min: z.number(),
    max: z.number(),
    totalQuestions: z.number()
  })
});

const evaluateCandidatePerformancePrompt = ai.definePrompt({
  name: 'evaluateCandidatePerformancePrompt',
  input: {schema: EvaluateCandidatePerformancePromptInputSchema},
  output: {schema: EvaluateCandidatePerformanceOutputSchema},
  // Modified prompt section
  prompt: `You are an expert recruiter evaluating candidate performance...
  Evaluate the candidate based on:
  - Technical Acumen (0-100): ... 
  - Communication Skills (0-100): ...
  ...
  
  Provide scores in format:
  Technical Acumen: [score]
  Communication Skills: [score]
  ...

  Job Description: {{{jobDescription}}}
  Candidate CV: {{{candidateCv}}}
  Interview Answers:
  {{#each interviewAnswers}}
  Question: {{{this.question}}}
  Answer: {{{this.answer}}}
  Response Time (seconds): {{{this.responseTimeSeconds}}}
  {{/each}}

  Evaluate the candidate based on the following criteria:
  - Technical Acumen: Evaluation of the candidate's technical skills as evidenced in their responses. Score: 0-100
  - Communication Skills: Clarity, coherence, and effectiveness in conveying ideas. Score: 0-100
  - Responsiveness & Agility: Assess response timeliness using actual metrics (average: {{responseTimeMetrics.average}}s). Score 0-100 based on:
    - Speed: Compare to expected times (<=30s excellent, 30-60s good, >60s needs improvement)
    - Consistency: Evaluate variance between fastest ({{responseTimeMetrics.min}}s) and slowest ({{responseTimeMetrics.max}}s) responses
    - Complexity Adjustment: Longer times acceptable for technical/leadership questions
  - Problem-Solving & Adaptability: Ability to handle follow-up questions and provide relevant clarifications. Score: 0-100
  - Cultural Fit & Soft Skills: Evaluation of interpersonal communication and potential fit for the company culture. Score: 0-100

  Provide the following in your evaluation:
  - Response Time Analysis: Include average/median response times
  - Timing Score Contribution: Specify how timing affected overall score (20% weight)
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
    const responseTimes = input.interviewAnswers.map(a => a.responseTimeSeconds);
const responseTimeMetrics = {
  average: Math.round(responseTimes.reduce((a,b) => a + b, 0) / responseTimes.length || 0),
  min: Math.min(...responseTimes),
  max: Math.max(...responseTimes),
  totalQuestions: responseTimes.length
};
const {output} = await evaluateCandidatePerformancePrompt({...input, responseTimeMetrics});
    return output!;
  }
);
