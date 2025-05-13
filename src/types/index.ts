import type { EvaluateCandidatePerformanceOutput } from '@/ai/flows/evaluate-candidate-performance';

export type AppStage = 'upload' | 'interview' | 'report';

export interface InterviewEntry {
  question: string;
  answer: string;
  responseTimeSeconds: number;
}

export interface PerformanceEvaluationResult extends EvaluateCandidatePerformanceOutput {
  technicalAcumen: number;
  communicationSkills: number;
  responsivenessAgility: number;
  culturalFitSoftSkills: number;
  responseTimeMetrics: {
    average: number;
    min: number;
    max: number;
    totalQuestions: number;
  };
  problemSolvingAdaptability: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  areasForImprovement: string;
  detailedFeedback: string;
}
