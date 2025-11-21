"use client";

import React, { useState, useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { QuizAttempt } from '@/ai/schemas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Target,
  Zap,
  Lightbulb,
  Loader2,
  ServerCrash,
  TrendingUp,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { generateQuizAnalysis } from '@/ai/flows/generate-quiz-analysis';

interface AnalysisDialogProps {
  attempt: QuizAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ✅ UPDATED: Match the analysis structure from generate-quiz-analysis.ts
interface QuizAnalysis {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

const AnalysisDialogComponent = ({
  attempt,
  open,
  onOpenChange,
}: AnalysisDialogProps) => {
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !attempt) return;

    const loadAnalysis = async () => {
      setLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        // ✅ STEP 1: Try to load from sessionStorage FIRST
        const analysisKey = `quiz-analysis-${attempt.slotId}`;
        const storedAnalysis = sessionStorage.getItem(analysisKey);
        
        console.log('[AnalysisDialog] 🔍 Looking for analysis with key:', analysisKey);
        console.log('[AnalysisDialog] 📦 Found stored analysis:', storedAnalysis);

        if (storedAnalysis) {
          try {
            const parsedAnalysis = JSON.parse(storedAnalysis) as QuizAnalysis;
            console.log('[AnalysisDialog] ✅ Loaded analysis from sessionStorage:', parsedAnalysis);
            setAnalysis(parsedAnalysis);
            setLoading(false);
            return;
          } catch (parseErr) {
            console.error('[AnalysisDialog] ❌ Failed to parse stored analysis:', parseErr);
          }
        }

        // ✅ STEP 2: If not in sessionStorage, generate new analysis
        console.log('[AnalysisDialog] ⚠️ No analysis in sessionStorage, generating new...');
        
        const analysisInput = {
          questions: attempt.questions.map((q, i) => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: attempt.userAnswers[i] || 'No answer',
            isCorrect: attempt.userAnswers[i] === q.correctAnswer
          })),
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          format: attempt.format
        };

        const newAnalysis = await generateQuizAnalysis(analysisInput);
        
        console.log('[AnalysisDialog] ✅ Generated new analysis:', newAnalysis);
        setAnalysis(newAnalysis);
        
        // ✅ STEP 3: Save to sessionStorage for future access
        sessionStorage.setItem(analysisKey, JSON.stringify(newAnalysis));
      } catch (err: any) {
        console.error('[AnalysisDialog] ❌ Error loading/generating analysis:', err);
        setError(err.message || "Could not load AI analysis. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [open, attempt]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="animate-spin h-8 w-8 mb-4 text-primary" />
          <p className="font-semibold">Generating your analysis...</p>
          <p className="text-sm">The AI coach is reviewing the match footage.</p>
        </div>
      );
    }

    if (error && !analysis) {
      return (
        <Alert variant="destructive" className="mt-4">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    // ✅ UPDATED: Display analysis matching Results page format
    if (analysis) {
      const hasAiAnalysis = analysis && analysis.overallFeedback;

      return (
        <div className="space-y-6">
          {/* Warning if AI was unavailable */}
          {analysis.overallFeedback.includes('unavailable') && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  AI analysis wasn't available for this session. Showing fallback insights.
                </p>
              </div>
            </div>
          )}

          {/* Overall Summary */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="text-primary w-5 h-5" /> Overall Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {analysis.overallFeedback}
              </p>
            </CardContent>
          </Card>

          {/* Two Column Grid: Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" /> Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                      <span className="text-muted-foreground text-sm">{strength}</span>
                    </li>
                  ))}
                  {analysis.strengths.length === 0 && (
                    <li className="text-muted-foreground text-sm">
                      No specific strengths identified.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Target className="w-5 h-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                      <span className="text-muted-foreground text-sm">{area}</span>
                    </li>
                  ))}
                  {analysis.areasForImprovement.length === 0 && (
                    <li className="text-muted-foreground text-sm">
                      No specific areas identified.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <Lightbulb className="w-5 h-5" /> Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                    <span className="text-muted-foreground text-sm">{rec}</span>
                  </li>
                ))}
                {analysis.recommendations.length === 0 && (
                  <li className="text-muted-foreground text-sm">Keep practicing!</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Third Umpire Review
          </DialogTitle>
          <DialogDescription className="text-center">
            A detailed debrief of your {attempt.format} innings.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(AnalysisDialogComponent);
