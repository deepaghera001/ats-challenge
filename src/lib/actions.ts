"use server";

import { generateInterviewQuestions, GenerateInterviewQuestionsInput, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { evaluateCandidatePerformance, EvaluateCandidatePerformanceInput, EvaluateCandidatePerformanceOutput } from '@/ai/flows/evaluate-candidate-performance';
import type { InterviewEntry } from '@/types';

export async function handleGenerateQuestionsAction(jobDescription: string, cv: string): Promise<GenerateInterviewQuestionsOutput> {
  if (!jobDescription || !cv) {
    throw new Error("Job description and CV cannot be empty.");
  }
  const input: GenerateInterviewQuestionsInput = { jobDescription, cv };
  try {
    const result = await generateInterviewQuestions(input);
    if (!result || !result.questions || result.questions.length === 0) {
      // Fallback if AI returns no questions
      return { questions: ["Tell me about yourself.", "What are your strengths?", "Why are you interested in this role?"] };
    }
    return result;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    // Provide fallback questions on error
    return { questions: ["Describe a challenging project you worked on.", "Where do you see yourself in 5 years?", "Do you have any questions for us?"] };
  }
}

export async function handleEvaluatePerformanceAction(
  jobDescription: string,
  cv: string,
  interviewData: InterviewEntry[]
): Promise<EvaluateCandidatePerformanceOutput> {
  if (!jobDescription || !cv || interviewData.length === 0) {
    throw new Error("Job description, CV, and interview data are required for evaluation.");
  }
  
  const input: EvaluateCandidatePerformanceInput = {
    jobDescription,
    candidateCv: cv,
    interviewAnswers: interviewData,
  };

  try {
    const result = await evaluateCandidatePerformance(input);
    return result;
  } catch (error) {
    console.error("Error evaluating candidate performance:", error);
    // Provide a fallback/error structure for evaluation
    return {
        overallScore: 0,
        technicalAcumen: 0,
        communicationSkills: 0,
        responsivenessAgility: 0,
        problemSolvingAdaptability: 0,
        culturalFitSoftSkills: 0,
        strengths: "Could not determine due to an error.",
        weaknesses: "Could not determine due to an error.",
        areasForImprovement: "Could not determine due to an error.",
        detailedFeedback: "Evaluation failed. Please try again."
    };
  }
}
