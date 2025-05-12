"use client";

import type { InterviewEntry } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, MessageCircle, CheckCircle2, Clock } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";

type InterviewChatProps = {
  questions: string[];
  onComplete: (interviewData: InterviewEntry[]) => Promise<void>;
  isLoadingNextStep: boolean;
};

export function InterviewChat({ questions, onComplete, isLoadingNextStep }: InterviewChatProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [interviewLog, setInterviewLog] = useState<InterviewEntry[]>([]);
  const { startTimer, stopTimer, resetTimer, elapsedTimeSeconds } = useTimer();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (questions.length > 0) {
      startTimer();
    }
    return () => stopTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions]); // Only re-run if the question index or questions array changes

  const handleNextQuestion = useCallback(async () => {
    const responseTime = stopTimer();
    const newEntry: InterviewEntry = {
      question: currentQuestion,
      answer: currentAnswer || "No answer provided.", // Handle empty answer
      responseTimeSeconds: responseTime,
    };
    const updatedLog = [...interviewLog, newEntry];
    setInterviewLog(updatedLog);
    setCurrentAnswer("");

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      resetTimer(); // Resets timer for the new question which will be started by useEffect
    } else {
      await onComplete(updatedLog);
    }
  }, [currentAnswer, currentQuestion, currentQuestionIndex, interviewLog, onComplete, resetTimer, stopTimer, totalQuestions]);

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
          <p className="p-3 bg-muted rounded-md min-h-[60px]">{currentQuestion}</p>
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
          {isLoadingNextStep ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {currentQuestionIndex === totalQuestions - 1 ? "Evaluating..." : "Loading..."}
            </>
          ) : currentQuestionIndex === totalQuestions - 1 ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Finish Interview & Evaluate
            </>
          ) : (
            "Submit Answer & Next Question"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
