'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QuizView from '@/components/quiz/QuizView';
import QuizSummary from '@/components/quiz/QuizSummary';
import { getAuth } from 'firebase/auth';
import { AdDialog } from '@/components/AdDialog';
import { getInterstitialAdForSlot } from '@/lib/ads';
import { getAdBySlot } from '@/lib/ad-service';
import { CricketLoading } from '@/components/CricketLoading';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '@/ai/schemas';

interface QuizClientProps {
  brand: string;
  format: string;
}

interface QuizData {
  questions: QuizQuestion[];
  title: string;
  description: string;
}

type QuizState = 'loading' | 'playing' | 'answered' | 'loading-next' | 'completed';

export default function QuizClient({ brand, format }: QuizClientProps) {
  const auth = getAuth();
  
  const [userId, setUserId] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const [showBetweenQuestionAd, setShowBetweenQuestionAd] = useState(false);
  const [currentInterstitialConfig, setCurrentInterstitialConfig] = useState<any | null>(null);
  
  const [showAfterQuizAd, setShowAfterQuizAd] = useState(false);
  const [afterQuizAd, setAfterQuizAd] = useState<any | null>(null);

  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adFetchedForIndexRef = useRef<number | null>(null);

  const getBetweenQuestionAdSlot = useCallback(
    (qIndex: number): string | null => {
      if (qIndex === 1) return 'Q1_Q2';
      if (qIndex === 2) return 'Q2_Q3';
      if (qIndex === 3) return 'Q3_Q4';
      if (qIndex === 4) return 'Q4_Q5';
      return null;
    },
    []
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.uid) {
        setUserId(user.uid);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!userId) return;
      try {
        setQuizState('loading');
        const response = await fetch(
          `/api/quiz?brand=${encodeURIComponent(brand)}&format=${encodeURIComponent(format)}`,
          {
            headers: {
              'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
            },
          }
        );
        if (!response.ok) throw new Error(`Failed to fetch quiz`);
        const data = await response.json();
        if (!data.questions || data.questions.length === 0) throw new Error('No questions');
        setQuizData(data);
        setQuizState('playing');
      } catch (error) {
        console.error('Error:', error);
        setQuizState('completed');
      }
    };
    if (userId) initializeQuiz();
  }, [userId, brand, format, auth]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (quizState !== 'playing' || !quizData) return;
      
      setSelectedOption(answer);
      setUserAnswers([...userAnswers, answer]);
      setQuizState('answered');

      const currentQuestion = quizData.questions[currentQuestionIndex];
      if (answer !== 'no-ball' && currentQuestion.correctAnswer === answer) {
        setQuizScore((prev) => prev + 1);
      }

      questionTimerRef.current = setTimeout(() => {
        proceedAfterAnswer();
      }, 1500);
    },
    [currentQuestionIndex, quizState, quizData, userAnswers]
  );

  const handleNoBall = useCallback(() => {
    handleAnswer('no-ball');
  }, [handleAnswer]);

  const handleHintRequest = useCallback(async () => {
    return 'Hint';
  }, []);

  // ✅ FIXED: Fetch ad IMMEDIATELY when answer submitted
  const proceedAfterAnswer = useCallback(async () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    const adSlot = getBetweenQuestionAdSlot(nextQuestionIndex);

    if (adSlot && nextQuestionIndex < quizData!.questions.length) {
      // ✅ Only fetch if we haven't already fetched for this index
      if (adFetchedForIndexRef.current !== nextQuestionIndex) {
        console.log(`🔍 [AdFetch] Fetching Firebase ad for slot: ${adSlot}`);
        
        try {
          const interstitialConfig = await getInterstitialAdForSlot(adSlot as any);
          
          if (interstitialConfig) {
            console.log(`✅ [AdFetch] Firebase ad loaded for ${adSlot}:`, interstitialConfig);
            setCurrentInterstitialConfig(interstitialConfig);
            adFetchedForIndexRef.current = nextQuestionIndex;
            setShowBetweenQuestionAd(true);
            setQuizState('loading-next');

            // ✅ USE DURATION FROM FIREBASE
            adTimerRef.current = setTimeout(() => {
              continueToNextQuestion();
            }, interstitialConfig.durationMs || 10000);
          } else {
            console.log(`⚠️ [AdFetch] No ad found for ${adSlot}`);
            adFetchedForIndexRef.current = nextQuestionIndex;
            continueToNextQuestion();
          }
        } catch (err) {
          console.error(`❌ [AdFetch] Error fetching ad:`, err);
          adFetchedForIndexRef.current = nextQuestionIndex;
          continueToNextQuestion();
        }
      } else {
        // Already fetched for this index, use cached config
        if (currentInterstitialConfig) {
          setShowBetweenQuestionAd(true);
          setQuizState('loading-next');
          adTimerRef.current = setTimeout(() => {
            continueToNextQuestion();
          }, currentInterstitialConfig.durationMs || 10000);
        } else {
          continueToNextQuestion();
        }
      }
    } else {
      continueToNextQuestion();
    }
  }, [currentQuestionIndex, quizData, getBetweenQuestionAdSlot, currentInterstitialConfig]);

  const continueToNextQuestion = useCallback(() => {
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (adTimerRef.current) clearTimeout(adTimerRef.current);
    if (questionTimerRef.current) clearTimeout(questionTimerRef.current);

    if (nextQuestionIndex < quizData!.questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOption(null);
      setQuizState('playing');
      setShowBetweenQuestionAd(false);
      setCurrentInterstitialConfig(null);
    } else {
      setQuizState('completed');
      setShowBetweenQuestionAd(false);
      setCurrentInterstitialConfig(null);
      
      // ✅ Fetch AfterQuiz ad when quiz completes
      if (userId) {
        fetchAfterQuizAd();
      }
    }
  }, [currentQuestionIndex, quizData, userId]);

  // ✅ NEW: Fetch ad for after quiz
  const fetchAfterQuizAd = useCallback(async () => {
    try {
      console.log(`🔍 [AfterQuizAd] Fetching ad for AfterQuiz slot`);
      const ad = await getAdBySlot('AfterQuiz');
      if (ad) {
        console.log(`✅ [AfterQuizAd] Ad loaded:`, ad);
        setAfterQuizAd(ad);
        setShowAfterQuizAd(true);
      } else {
        console.log(`⚠️ [AfterQuizAd] No ad found`);
      }
    } catch (err) {
      console.error(`❌ [AfterQuizAd] Error:`, err);
    }
  }, []);

  const handleAfterQuizAdFinished = useCallback(() => {
    setShowAfterQuizAd(false);
    setAfterQuizAd(null);
  }, []);

  useEffect(() => {
    return () => {
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    };
  }, []);

  if (authLoading || quizState === 'loading' || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <CricketLoading />
        <p className="text-gray-400 text-sm">Loading quiz...</p>
      </div>
    );
  }

  if (showBetweenQuestionAd && currentInterstitialConfig) {
    if (currentInterstitialConfig.type === 'static' && currentInterstitialConfig.logoUrl) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 max-w-4xl mx-auto px-4 py-8"
        >
          <div className="text-center space-y-3">
            <h2 className="text-lg font-bold text-white">Quick Break!</h2>
            <p className="text-gray-400 text-sm">{currentInterstitialConfig.logoHint || 'Featured sponsor'}</p>
          </div>

          <img
            src={currentInterstitialConfig.logoUrl}
            alt="Ad"
            className="h-56 w-full rounded-lg shadow-lg object-cover"
          />

          <p className="text-center text-gray-500 text-xs">Loading next question...</p>
        </motion.div>
      );
    }

    if (currentInterstitialConfig.type === 'video' && currentInterstitialConfig.videoUrl) {
      return (
        <AdDialog
          open={true}
          onOpenChange={() => {}}
          onAdFinished={() => continueToNextQuestion()}
          duration={currentInterstitialConfig.durationSec || 10}
          skippableAfter={currentInterstitialConfig.skippableAfterSec || 10}
          adTitle={currentInterstitialConfig.videoTitle || 'Advertisement'}
          adType="video"
          adUrl={currentInterstitialConfig.videoUrl}
        />
      );
    }
  }

  if (quizState === 'playing' && quizData) {
    const currentQuestion = quizData.questions[currentQuestionIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto px-4 py-8"
      >
        <QuizView
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quizData.questions.length}
          onAnswer={handleAnswer}
          onNoBall={handleNoBall}
          brand={brand}
          format={format}
          onHintRequest={handleHintRequest}
          hint={null}
          isHintLoading={false}
          soundEnabled={false}
          quizSource="fallback"
        />
      </motion.div>
    );
  }

  if (quizState === 'completed') {
    return (
      <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
        {showAfterQuizAd && afterQuizAd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AdDialog
              open={showAfterQuizAd}
              onOpenChange={(open) => {
                if (!open) handleAfterQuizAdFinished();
              }}
              onAdFinished={handleAfterQuizAdFinished}
              duration={afterQuizAd?.duration || 15}
              skippableAfter={15}
              adTitle={afterQuizAd?.title || "Ad"}
              adType={afterQuizAd?.adType === "video" ? "video" : "image"}
              adUrl={afterQuizAd?.mediaUrl || ""}
              adHint={afterQuizAd?.hint}
            >
              <p className="text-xs text-muted-foreground mt-2">
                Watch this ad to view your results.
              </p>
            </AdDialog>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuizSummary
            quizData={quizData}
            userAnswers={userAnswers}
            brand={brand}
            format={format}
            score={quizScore}
            totalQuestions={quizData.questions.length}
          />
        </motion.div>
      </div>
    );
  }

  return null;
}