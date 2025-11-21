'use client';

import React, { useState, memo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Ban, Sparkles, Calendar, CheckCircle, Clock, Eye, ServerCrash, WifiOff, Check, Loader2 } from 'lucide-react';
import type { QuizAttempt } from '@/ai/schemas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdDialog } from '@/components/AdDialog';
import { getAdBySlot, getAdsBySlot } from '@/lib/ad-service'; // ✅ ADDED getAdsBySlot
import AnalysisDialog from '@/components/history/AnalysisDialog';
import ReviewDialog from '@/components/history/ReviewDialog';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { normalizeTimestamp } from '@/lib/dates';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================
// HELPER COMPONENTS
// ============================================

export const HistoryItemSkeleton = () => (
  <Card className="bg-card/80 shadow-lg">
    <CardHeader>
      <div className="flex items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-md mt-1 flex-shrink-0" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex justify-end gap-2">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </CardContent>
  </Card>
);

export const ErrorStateDisplay = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mt-4">
    {message.toLowerCase().includes('offline') || message.toLowerCase().includes('unavailable') ? (
      <WifiOff className="h-4 w-4" />
    ) : (
      <ServerCrash className="h-4 w-4" />
    )}
    <AlertTitle>Error Loading History</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const getSlotTimings = (timestamp: any) => {
  const attemptDate = normalizeTimestamp(timestamp);
  if (!attemptDate) return 'Invalid Time';

  const minutes = attemptDate.getMinutes();
  const slotStartMinute = Math.floor(minutes / 10) * 10;

  const slotStartTime = new Date(attemptDate);
  slotStartTime.setMinutes(slotStartMinute, 0, 0);

  const slotEndTime = new Date(slotStartTime.getTime() + 10 * 60 * 1000);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

  return `${formatTime(slotStartTime)} - ${formatTime(slotEndTime)}`;
};

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

const HistoryItemComponent = ({ attempt }: { attempt: QuizAttempt }) => {
  const { markAttemptAsReviewed } = useAuth();
  const { toast } = useToast();
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isReviewed, setIsReviewed] = useState(attempt.reviewed || false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAd, setReviewAd] = useState<any | null>(null);
  const [companyName, setCompanyName] = useState<string>(attempt.brand); // ✅ NEW: Store real company name

  const isDisqualified = !!attempt.reason;

  // ✅ NEW: FETCH REAL COMPANY NAME FROM FIREBASE
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        console.log(`🔍 [History] Fetching company name for: ${attempt.format}`);
        const ads = await getAdsBySlot(attempt.format as any);
        
        if (ads.length > 0) {
          setCompanyName(ads[0].companyName);
          console.log(`✅ [History] Found company name: ${ads[0].companyName} for ${attempt.format}`);
        } else {
          setCompanyName(attempt.brand); // ✅ Fallback to attempt.brand
          console.log(`⚠️ [History] No ad found, using fallback: ${attempt.brand}`);
        }
      } catch (error) {
        console.error(`❌ [History] Error fetching company name:`, error);
        setCompanyName(attempt.brand); // ✅ Fallback on error
      }
    };

    fetchCompanyName();
  }, [attempt.format, attempt.brand]);

  // ✅ FETCH AD FROM FIREBASE WHEN REVIEW BUTTON CLICKED
  const handleReviewClick = useCallback(async () => {
    if (isDisqualified || isReviewing) return;

    // If already reviewed, show toast and return
    if (isReviewed) {
      toast({
        title: 'Already viewed',
        description: 'You have already viewed the review for this attempt.',
      });
      return;
    }

    setIsReviewing(true);

    // ✅ Fetch AfterQuiz ad from Firebase
    try {
      const ad = await getAdBySlot('AfterQuiz');
      
      if (ad) {
        console.log('[HistoryItem] ✅ Ad fetched:', ad);
        setReviewAd(ad);
        setShowAdDialog(true);
      } else {
        console.warn('[HistoryItem] ⚠️ No ad found, proceeding without ad');
        // ✅ FALLBACK: No ad available, mark as reviewed directly
        const { success, reason } = await markAttemptAsReviewed(attempt.slotId);
        if (success) {
          setIsReviewed(true);
          setShowReviewDialog(true);
        } else {
          toast({
            title: 'Update Failed',
            description: `Could not save review state: ${reason || 'Please check connection.'}`,
            variant: 'destructive',
          });
        }
        setIsReviewing(false);
      }
    } catch (err) {
      console.error('[HistoryItem] ❌ Ad fetch error:', err);
      toast({ 
        title: 'Ad Error', 
        description: 'Could not load review ad. Please try again.', 
        variant: 'destructive' 
      });
      setIsReviewing(false);
    }
  }, [isDisqualified, isReviewed, isReviewing, toast, attempt.slotId, markAttemptAsReviewed]);

  const handleAdFinished = useCallback(async () => {
    setShowAdDialog(false);
    try {
      const { success, reason } = await markAttemptAsReviewed(attempt.slotId);
      if (success) {
        setIsReviewed(true);
        toast({
          title: 'Success',
          description: 'You can now review your answers.',
        });
        setShowReviewDialog(true);
      } else {
        toast({
          title: 'Update Failed',
          description: `Could not save review state: ${reason || 'Please check connection.'}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsReviewing(false);
      setReviewAd(null);
    }
  }, [attempt.slotId, markAttemptAsReviewed, toast]);

  const handleAdDialogClose = (open: boolean) => {
    if (!open) {
      if (isReviewing && !showReviewDialog) {
        setIsReviewing(false);
      }
    }
    setShowAdDialog(open);
    setReviewAd(null);
  };

  const attemptDate = normalizeTimestamp(attempt.timestamp);
  const isPerfectScore = attempt.score === attempt.totalQuestions && !attempt.reason;
  const slotTiming = getSlotTimings(attempt.timestamp);

  const formattedDate = attemptDate
    ? attemptDate
        .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '-')
    : 'Invalid Date';

  return (
    <>
      <Card key={attempt.slotId} className="bg-card/80 shadow-lg animate-fade-in-up">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0">
              {isDisqualified ? (
                <Ban className="h-8 w-8 text-destructive" />
              ) : isPerfectScore ? (
                <Award className="h-8 w-8 text-primary" />
              ) : (
                <CheckCircle className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-grow">
              <CardTitle className="text-lg">{attempt.format} Quiz</CardTitle>
              <CardDescription>Sponsored by {companyName}</CardDescription>
              <CardDescription className="pt-2">
                {isDisqualified ? 'Disqualified (No Ball)' : `Scored ${attempt.score}/${attempt.totalQuestions}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{slotTiming} (IST)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReviewClick} 
              disabled={isDisqualified || isReviewing}
            >
              {isReviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isReviewed ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Eye className="mr-2 h-4 w-4 text-primary" />
              )}
              {isReviewing ? 'Loading...' : isReviewed ? 'Reviewed' : 'Review'}
            </Button>

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsAnalysisOpen(true)} 
              disabled={isDisqualified}
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ AD DIALOG - NO SKIP BUTTON (skippableAfter > duration) */}
      {showAdDialog && reviewAd && (
        <AdDialog
          open={showAdDialog}
          onOpenChange={handleAdDialogClose}
          onAdFinished={handleAdFinished}
          duration={reviewAd?.duration || 30}
          skippableAfter={reviewAd?.duration || 30}
          adTitle={reviewAd?.companyName || 'Ad'}
          adType={reviewAd?.adType === 'video' ? 'video' : 'image'}
          adUrl={reviewAd?.mediaUrl || ''}
          adHint={reviewAd?.companyName}
        >
          <p className="text-xs text-muted-foreground mt-2">
            Watch this ad completely to review your answers. This is a one-time action per quiz.
          </p>
        </AdDialog>
      )}

      {attempt && (
        <ReviewDialog 
          open={showReviewDialog} 
          onOpenChange={setShowReviewDialog} 
          attempt={attempt} 
        />
      )}

      {attempt && (
        <AnalysisDialog 
          open={isAnalysisOpen} 
          onOpenChange={setIsAnalysisOpen} 
          attempt={attempt} 
        />
      )}
    </>
  );
};

export const HistoryItem = memo(HistoryItemComponent);

// ============================================
// MAIN COMPONENT
// ============================================

interface QuizHistoryContentProps {
  attempts: QuizAttempt[];
  isLoading: boolean;
  error: string | null;
}

export default function QuizHistoryContent({ attempts, isLoading, error }: QuizHistoryContentProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Show error state
  if (error) {
    return <ErrorStateDisplay message={error} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <HistoryItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ✅ SIGNED-IN: Show full-screen empty message when no attempts
  if (user && (!attempts || attempts.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-250px)] px-4 text-center"
      >
        <div className="relative mx-auto mb-6 w-16 h-16 rounded-full bg-[#081221] flex items-center justify-center shadow-inner">
          <Award className="w-10 h-10 text-yellow-400" strokeWidth={1.8} />
        </div>

        <h2 className="text-3xl font-semibold text-white mb-3">No Quiz History Yet</h2>

        <p className="max-w-xl text-base text-slate-300 mb-8 leading-relaxed">
          Take your first quiz to see your progress and analyze your performance here.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-yellow-400 text-slate-900 font-medium shadow-md hover:brightness-95 transition-all duration-200"
          >
            Get to Home
          </button>
        </div>
      </motion.div>
    );
  }

  // Show history list
  return (
    <div className="space-y-4 pt-4">
      {attempts.map((attempt) => (
        <HistoryItem key={attempt.slotId} attempt={attempt} />
      ))}
    </div>
  );
}
