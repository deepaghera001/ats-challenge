"use client";

import type { PerformanceEvaluationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, RotateCcw, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from "lucide-react";

type PerformanceReportProps = {
  report: PerformanceEvaluationResult | null;
  onRestart: () => void;
};

export function PerformanceReport({ report, onRestart }: PerformanceReportProps) {
  if (!report) {
    return (
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Evaluation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error generating the performance report. Please try again.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onRestart} className="w-full text-lg py-6">
            <RotateCcw className="mr-2 h-5 w-5" />
            Start New Assessment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const scoreColor = report.overallScore >= 70 ? "text-green-600" : report.overallScore >= 40 ? "text-yellow-500" : "text-red-600";

  const technicalAcumen = report.technicalAcumen;
  const communicationSkills = report.communicationSkills;
  const responsivenessAgility = report.responsivenessAgility;
  const problemSolvingAdaptability = report.problemSolvingAdaptability;
  const culturalFitSoftSkills = report.culturalFitSoftSkills;

  return (
    <Card className="w-full max-w-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BarChart3 className="h-8 w-8 text-primary" />
          Performance Evaluation
        </CardTitle>
        <CardDescription>
          Summary of the candidate's interview performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Overall Score</p>
          <p className={`text-6xl font-bold ${scoreColor}`}>{report.overallScore}/100</p>
          <Progress value={report.overallScore} className="mt-2 h-4" />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Technical Acumen</h3>
            <Progress value={technicalAcumen} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{technicalAcumen}/100</p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Communication Skills</h3>
            <Progress value={communicationSkills} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{communicationSkills}/100</p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Responsiveness & Agility</h3>
            <Progress value={responsivenessAgility} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{responsivenessAgility}/100</p>
          </div>
          <div className="p-4 border rounded-md">
            <h3 className="font-semibold mb-2">Problem-Solving & Adaptability</h3>
            <Progress value={problemSolvingAdaptability} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{problemSolvingAdaptability}/100</p>
          </div>
          <div className="p-4 border rounded-md md:col-span-2">
            <h3 className="font-semibold mb-2">Cultural Fit & Soft Skills</h3>
            <Progress value={culturalFitSoftSkills} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{culturalFitSoftSkills}/100</p>
          </div>
        </div>
  
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="strengths">
            <AccordionTrigger className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" /> Strengths
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base p-2 bg-background rounded-md">
              {report.strengths || "No specific strengths identified."}
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="weaknesses">
            <AccordionTrigger className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-red-500" /> Weaknesses
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base p-2 bg-background rounded-md">
              {report.weaknesses || "No specific weaknesses identified."}
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="improvement">
            <AccordionTrigger className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" /> Areas for Improvement
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-base p-2 bg-background rounded-md">
              {report.areasForImprovement || "No specific areas for improvement identified."}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="detailedFeedback">
            <AccordionTrigger className="text-xl font-semibold">
              Detailed Feedback
            </AccordionTrigger>
            <AccordionContent className="text-base p-2 bg-background rounded-md whitespace-pre-line">
              {report.detailedFeedback || "No detailed feedback available."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
  
      </CardContent>
      <CardFooter>
        <Button onClick={onRestart} variant="outline" className="w-full text-lg py-6">
          <RotateCcw className="mr-2 h-5 w-5" />
          Start New Assessment
        </Button>
      </CardFooter>
    </Card>
  );
}
