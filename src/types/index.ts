import type { EvaluateCandidatePerformanceOutput } from '@/ai/flows/evaluate-candidate-performance';

export type AppStage = 'upload' | 'interview' | 'report';

export interface InterviewEntry {
  question: string;
  answer: string;
  responseTimeSeconds: number;
}

export interface PerformanceEvaluationResult extends EvaluateCandidatePerformanceOutput {}
