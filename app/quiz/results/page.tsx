"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, Eye, Ban, BadgeCheck, AlertTriangle, TrendingUp, Target, Lightbulb } from 'lucide-react';
import type { QuizAttempt } from '@/ai/schemas';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { decodeAttempt } from '@/lib/quiz-utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthProvider';
import { createPaymentRequest } from '@/lib/payment-service';

const AnalysisDialog = dynamic(
    () => import('@/components/history/AnalysisDialog'),
    { ssr: false }
);
const ReviewDialog = dynamic(
    () => import('@/components/history/ReviewDialog'),
    { ssr: false }
);

// ✅ ADD: QuizAnalysis interface
interface QuizAnalysis {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

const LoadingSkeleton = () => (
    <PageWrapper title="Loading Results...">
        <div className="space-y-4 animate-pulse">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="space-y-3 pt-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        </div>
    </PageWrapper>
);

const ResultsContent = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentCreated, setPaymentCreated] = useState(false);
    
    // ✅ ADD: AI Analysis state
    const [aiAnalysis, setAiAnalysis] = useState<QuizAnalysis | null>(null);
    const [showAiAnalysis, setShowAiAnalysis] = useState(false);

    const [attempt, setAttempt] = useState<QuizAttempt | null>(() => {
        const attemptData = searchParams.get('attempt');
        if (!attemptData) return null;
        return decodeAttempt(attemptData);
    });

    // ✅ LOAD AI ANALYSIS from sessionStorage
    useEffect(() => {
        if (!attempt) return;

        const analysisKey = `quiz-analysis-${attempt.slotId}`;
        const storedAnalysis = sessionStorage.getItem(analysisKey);
        
        console.log('[Results] 🔍 Looking for analysis with key:', analysisKey);
        console.log('[Results] 📦 Found stored analysis:', storedAnalysis);

        if (storedAnalysis) {
            try {
                const parsedAnalysis = JSON.parse(storedAnalysis) as QuizAnalysis;
                console.log('[Results] ✅ Parsed analysis:', parsedAnalysis);
                setAiAnalysis(parsedAnalysis);
            } catch (parseErr) {
                console.error('[Results] ❌ Failed to parse stored analysis:', parseErr);
            }
        } else {
            console.log('[Results] ⚠️ No analysis found in sessionStorage');
        }
    }, [attempt]);

    // Create payment request for perfect score
    useEffect(() => {
        if (!attempt || !user) return;
        if (paymentCreated) return;
        
        const isPerfectScore = attempt.score === attempt.totalQuestions;
        const isDisqualified = !!attempt.reason;
        
        if (isPerfectScore && !isDisqualified) {
            const handlePaymentCreation = async () => {
                try {
                    const attemptId = searchParams.get('attemptId') || `quiz_${Date.now()}`;
                    const paymentId = await createPaymentRequest(
                        user.uid,
                        attemptId,
                        attempt.score,
                        attempt.totalQuestions
                    );
                    
                    if (paymentId) {
                        setPaymentCreated(true);
                        toast({
                            title: "🎉 Congratulations!",
                            description: "You've earned ₹100! Payment request has been submitted to admin for processing.",
                            duration: 8000,
                        });
                        console.log('✅ Payment request created:', paymentId);
                    }
                } catch (error) {
                    console.error('Error creating payment request:', error);
                }
            };
            
            handlePaymentCreation();
        }
    }, [attempt, user, searchParams, toast, paymentCreated]);

    useEffect(() => {
        if (attempt) {
            setLoading(false);
            return;
        }

        const attemptId = searchParams.get('attemptId');
        if (!attemptId) {
            setError("No quiz data found in the URL.");
            setLoading(false);
            return;
        }

        if (!user) {
            return;
        }

        const fetchAttemptFromDB = async () => {
            if (!db) {
                setError("Database connection unavailable.");
                setLoading(false);
                return;
            }
            try {
                const attemptRef = doc(db, 'users', user.uid, 'quizAttempts', attemptId);
                const docSnap = await getDoc(attemptRef);
                if (docSnap.exists()) {
                    setAttempt(docSnap.data() as QuizAttempt);
                } else {
                    setError("Could not find the specified quiz result.");
                }
            } catch (e) {
                console.error("Error fetching attempt from DB:", e);
                setError("Failed to fetch quiz results from the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttemptFromDB();
    }, [searchParams, user, attempt]);

    const handleViewAnswers = () => {
        if (!attempt) return;
        if (attempt.reviewed) {
            setShowReviewDialog(true);
        } else {
            toast({
                title: "Review Your Answers in History",
                description: "You can watch a short ad from the History page to unlock the answers for this quiz.",
                duration: 7000,
            });
            router.push('/history');
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }
    
    if (error || !attempt) {
        return (
            <PageWrapper title="Error">
                <Card className="text-center">
                    <CardHeader>
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold text-destructive">Could Not Load Quiz Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">{error || "There was an error decoding your results."}</p>
                        <Button onClick={() => router.push('/')}>
                            <Home className="mr-2 h-4 w-4" />
                            Return to Home
                        </Button>
                    </CardContent>
                </Card>
            </PageWrapper>
        );
    }
  
    const isPerfectScore = attempt.score === attempt.totalQuestions;
    const isDisqualified = !!attempt.reason;
    const hasAiAnalysis = aiAnalysis && aiAnalysis.overallFeedback;
  
    const getMotivationalLine = () => {
        if(isDisqualified) return { text: "Fair play is key to the spirit of cricket.", emoji: "🤝"};
        if(isPerfectScore) return { text: "Flawless century! You're a true champion. You've earned ₹100!", emoji: "🏆" };
        if(attempt.score >= 3) return { text: "Good effort! Keep practicing.", emoji: "💪" };
        return { text: "Tough match, but every game is a learning experience!", emoji: "👍" };
    }
    const motivationalLine = getMotivationalLine();
    const pageTitle = isDisqualified ? "Disqualified" : isPerfectScore ? "Perfect Score!" : "Quiz Complete!";
  
    return (
      <PageWrapper title="Quiz Scorecard" showBackButton>
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="space-y-6"
          >
              <Card className="text-center shadow-lg bg-card/80 overflow-hidden border-none">
                  <CardContent className="p-6 space-y-6">
                      <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="mx-auto bg-primary/10 p-4 rounded-full w-fit"
                      >
                          {isDisqualified ? (
                              <Ban className="h-12 w-12 text-destructive" />
                           ) : isPerfectScore ? (
                              <span className="text-5xl">💰</span>
                           ) : (
                              <span className="text-5xl">🏆</span>
                          )}
                      </motion.div>
                      
                      <div className="space-y-1">
                          <h1 className="text-3xl font-bold">{pageTitle}</h1>
                          <p className="text-muted-foreground">{attempt.format} Quiz - Sponsored by {attempt.brand}</p>
                      </div>
                      
                      {!isDisqualified && (
                          <>
                              <div className="flex justify-around items-center">
                                  <div className="text-center">
                                      <BadgeCheck className="h-8 w-8 text-primary mx-auto mb-1" />
                                      <p className="text-muted-foreground text-sm">You Scored</p>
                                      <p className="text-5xl font-bold tracking-tighter">
                                          <span className="text-primary">{attempt.score}</span>/{attempt.totalQuestions}
                                      </p>
                                  </div>
                              </div>
                              <p className="text-lg font-semibold text-primary">{motivationalLine.text}</p>
                              
                              {isPerfectScore && (
                                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                                      <CardContent className="p-4 text-center">
                                          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">₹100 Reward!</p>
                                          <p className="text-xs text-muted-foreground">Your payment request has been submitted to the admin. You will receive your reward shortly.</p>
                                      </CardContent>
                                  </Card>
                              )}
                          </>
                      )}
  
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <Button size="lg" variant="secondary" className="w-full h-14 text-base" onClick={() => router.push('/')}>
                              <Home className="mr-2 h-4 w-4" /> Go Home
                          </Button>
                          {!isDisqualified && (
                              <Button size="lg" variant="outline" className="w-full h-14 text-base" onClick={handleViewAnswers}>
                                  <Eye className="mr-2 h-5 w-5" /> View Answers
                              </Button>
                          )}
                      </div>
                  </CardContent>
              </Card>

              {/* ✅ NEW: AI ANALYSIS CARD - SHOWN IMMEDIATELY IF AVAILABLE */}
              {!isDisqualified && hasAiAnalysis && (
                <Card className="bg-card/80 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-primary w-5 h-5" />
                                <CardTitle>Third Umpire Review</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAiAnalysis(!showAiAnalysis)}
                            >
                                {showAiAnalysis ? 'Hide' : 'Show'}
                            </Button>
                        </div>
                        <CardDescription>A detailed debrief of your {attempt.format} innings.</CardDescription>
                    </CardHeader>
                    
                    {showAiAnalysis && (
                        <CardContent className="space-y-6">
                            {/* Warning if AI was unavailable */}
                            {aiAnalysis.overallFeedback.includes('unavailable') && (
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
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                                    <BadgeCheck className="w-5 h-5 text-primary" />
                                    Overall Summary
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {aiAnalysis.overallFeedback}
                                </p>
                            </div>

                            {/* Key Strengths */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-lg mb-3 text-green-600 dark:text-green-400">
                                    <TrendingUp className="w-5 h-5" />
                                    Key Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {aiAnalysis.strengths.map((strength, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                            <span className="text-muted-foreground">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Areas for Improvement */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-lg mb-3 text-orange-600 dark:text-orange-400">
                                    <Target className="w-5 h-5" />
                                    Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {aiAnalysis.areasForImprovement.map((area, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                                            <span className="text-muted-foreground">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-lg mb-3 text-yellow-600 dark:text-yellow-400">
                                    <Lightbulb className="w-5 h-5" />
                                    Recommendations
                                </h3>
                                <ul className="space-y-2">
                                    {aiAnalysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                            <span className="text-muted-foreground">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    )}
                </Card>
              )}

              {/* ✅ UPDATED: Old analysis dialog button - only show if no AI analysis available */}
              {!isDisqualified && !hasAiAnalysis && (
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary" /> AI Performance Analysis
                        </CardTitle>
                        <CardDescription>
                            Want to improve? Get a personalized analysis of your performance from our AI coach.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" className="w-full" onClick={() => setIsAnalysisOpen(true)}>
                            Generate Free Analysis
                        </Button>
                    </CardContent>
                </Card>
              )}
          </motion.div>

        {attempt && (
          <AnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            attempt={attempt}
          />
        )}
        
        {attempt && (
          <ReviewDialog
            open={showReviewDialog}
            onOpenChange={setShowReviewDialog}
            attempt={attempt}
          />
        )}

      </PageWrapper>
    );
};

export default function QuizResultsWrapperPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ResultsContent />
        </Suspense>
    );
}
