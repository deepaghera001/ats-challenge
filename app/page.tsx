
"use client";

import { useState } from "react";
import type { AppStage, InterviewEntry, PerformanceEvaluationResult } from "@/types";
import { AppLogo } from "@/components/assess-ai/AppLogo";
import { DocumentUploadForm } from "@/components/assess-ai/DocumentUploadForm";
import { InterviewChat } from "@/components/assess-ai/InterviewChat";
import { PerformanceReport } from "@/components/assess-ai/PerformanceReport";
import { handleGenerateQuestionsAction, handleEvaluatePerformanceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function AssessAIPage() {
  const [appStage, setAppStage] = useState<AppStage>('upload');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [cv, setCv] = useState<string>(''); // Stores the text content of the CV
  const [questions, setQuestions] = useState<string[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<PerformanceEvaluationResult | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleUploadAndGenerateQuestions = async (jd: string, cvText: string) => {
    setIsLoading(true);
    console.log("handleUploadAndGenerateQuestions called", jd, cvText);
    setError(null);
    try {
      setJobDescription(jd);
      setCv(cvText); // CV is now directly the string content

      const result = await handleGenerateQuestionsAction(jd, cvText);
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setAppStage('interview');
        toast({ title: "Success", description: "Interview questions generated." });
      } else {
        setError("Failed to generate questions or no questions returned. Please try again.");
        toast({ variant: "destructive", title: "Error", description: "No questions generated." });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate questions: ${errorMessage}`);
      toast({ variant: "destructive", title: "Error", description: `Question generation failed: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewComplete = async (interviewData: InterviewEntry[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // 'cv' state already holds the text content from the uploaded file or pasted text
      const result = await handleEvaluatePerformanceAction(jobDescription, cv, interviewData);
      setEvaluationResult(result);
      setAppStage('report');
      toast({ title: "Success", description: "Performance evaluation complete." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to evaluate performance: ${errorMessage}`);
      toast({ variant: "destructive", title: "Error", description: `Evaluation failed: ${errorMessage}` });
      // Fallback to report stage even on error to show what might be available or an error message there
      setEvaluationResult(null); // Explicitly set to null to indicate failure
      setAppStage('report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setAppStage('upload');
    setJobDescription('');
    setCv('');
    setQuestions([]);
    setEvaluationResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-gradient-to-br from-background to-slate-100 dark:from-background dark:to-slate-900">
      <header className="mb-10 text-center">
        <AppLogo className="mx-auto mb-2" />
        <p className="text-xl text-muted-foreground">AI-Powered Interview Assessment Tool</p>
      </header>

      <main className="w-full flex flex-col items-center">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md w-full max-w-2xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
          </div>
        )}

        {appStage === 'upload' && (
          <DocumentUploadForm onSubmit={handleUploadAndGenerateQuestions} isLoading={isLoading} />
        )}

        {appStage === 'interview' && (
          <InterviewChat 
            questions={questions} 
            onComplete={handleInterviewComplete} 
            isLoadingNextStep={isLoading}
            jobDescription={jobDescription}
            cv={cv}
          />
        )}

        {appStage === 'report' && (
          <PerformanceReport report={evaluationResult} onRestart={handleRestart} />
        )}

        {isLoading && appStage !== 'upload' && appStage !== 'interview' && ( /* Show general loader if not handled by specific components */
            <div className="mt-8 flex flex-col items-center text-primary">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="mt-2 text-lg">Processing...</p>
            </div>
          )
        }
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AssessAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
