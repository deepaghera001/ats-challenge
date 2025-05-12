"use client";

import type { InterviewEntry } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, MessageCircle, CheckCircle2, Clock, CornerDownRight } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { generateFollowUpQuestion } from "@/ai/flows/generate-follow-up-questions";
import { useToast } from "@/hooks/use-toast";

type InterviewChatProps = {
  questions: string[];
  onComplete: (interviewData: InterviewEntry[]) => Promise<void>;
  isLoadingNextStep: boolean;
  jobDescription?: string;
  cv?: string;
};

export function InterviewChat({ questions, onComplete, isLoadingNextStep, jobDescription = "", cv = "" }: InterviewChatProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [interviewLog, setInterviewLog] = useState<InterviewEntry[]>([]);
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const { startTimer, stopTimer, resetTimer, elapsedTimeSeconds } = useTimer();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (questions.length > 0) {
      startTimer();
    }
    return () => { stopTimer(); }; // Changed to return void
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions]); // Only re-run if the question index or questions array changes

  // Function to check if a follow-up question should be asked
  const checkForFollowUp = useCallback(async (question: string, answer: string) => {
    if (!answer.trim()) return false;
    
    setIsProcessingFollowUp(true);
    try {
      const result = await generateFollowUpQuestion({
        jobDescription,
        cv,
        previousQuestion: question,
        candidateAnswer: answer,
        originalQuestions: questions,
        currentQuestionIndex: currentQuestionIndex
      });
      
      if (result.shouldAskFollowUp && result.followUpQuestion) {
        setFollowUpQuestion(result.followUpQuestion);
        toast({
          title: "Follow-up Question Generated",
          description: result.reasoning,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error generating follow-up question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate follow-up question."
      });
      return false;
    } finally {
      setIsProcessingFollowUp(false);
    }
  }, [currentQuestionIndex, questions, jobDescription, cv, toast]);

  const handleNextQuestion = useCallback(async () => {
    const responseTime = stopTimer();
    
    // If we're answering a follow-up question, record it and move to the next original question
    if (followUpQuestion) {
      const followUpEntry: InterviewEntry = {
        question: followUpQuestion,
        answer: currentAnswer || "No answer provided.",
        responseTimeSeconds: responseTime,
      };
      
      const updatedLog = [...interviewLog, followUpEntry];
      setInterviewLog(updatedLog);
      setCurrentAnswer("");
      setFollowUpQuestion(null);
      
      // Move to the next question if we were on a follow-up
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        resetTimer();
      } else {
        await onComplete(updatedLog);
      }
      return;
    }
    
    // Handle regular question
    const newEntry: InterviewEntry = {
      question: currentQuestion,
      answer: currentAnswer || "No answer provided.",
      responseTimeSeconds: responseTime,
    };
    
    const updatedLog = [...interviewLog, newEntry];
    setInterviewLog(updatedLog);
    
    // Check if we should ask a follow-up before moving to the next question
    const shouldAskFollowUp = await checkForFollowUp(currentQuestion, currentAnswer);
    
    if (!shouldAskFollowUp) {
      setCurrentAnswer("");
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        resetTimer();
      } else {
        await onComplete(updatedLog);
      }
    } else {
      // If we're asking a follow-up, just clear the answer field but don't advance the question index
      setCurrentAnswer("");
      resetTimer();
    }
  }, [currentAnswer, currentQuestion, currentQuestionIndex, followUpQuestion, interviewLog, onComplete, resetTimer, stopTimer, totalQuestions, checkForFollowUp]);

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>No Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No interview questions were generated. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageCircle className="h-8 w-8 text-primary" />
          Interview in Progress
        </CardTitle>
        <CardDescription>
          Answer the questions below. Your response time is being recorded.
        </CardDescription>
        <div className="pt-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Question:</h3>
          {followUpQuestion ? (
            <div className="space-y-2">
              <p className="p-3 bg-muted rounded-md min-h-[60px] opacity-70">{currentQuestion}</p>
              <div className="flex items-start gap-2">
                <CornerDownRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <p className="p-3 bg-primary/10 rounded-md min-h-[60px] border-l-2 border-primary">{followUpQuestion}</p>
              </div>
            </div>
          ) : (
            <p className="p-3 bg-muted rounded-md min-h-[60px]">{currentQuestion}</p>
          )}
        </div>
        <div>
          <label htmlFor="candidateAnswer" className="font-semibold text-lg mb-2 block">Your Answer:</label>
          <Textarea
            id="candidateAnswer"
            placeholder="Type the candidate's answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="min-h-[150px] resize-y"
            disabled={isLoadingNextStep}
          />
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Time for this question: {elapsedTimeSeconds} seconds
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNextQuestion} 
          className="w-full text-lg py-6" 
          disabled={isLoadingNextStep || !currentAnswer.trim()}
        >
          {isLoadingNextStep || isProcessingFollowUp ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isProcessingFollowUp ? "Analyzing Answer..." : 
                currentQuestionIndex === totalQuestions - 1 ? "Evaluating..." : "Loading..."}
            </>
          ) : currentQuestionIndex === totalQuestions - 1 && !followUpQuestion ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Finish Interview & Evaluate
            </>
          ) : (
            followUpQuestion ? "Submit Follow-up Answer" : "Submit Answer & Next Question"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
