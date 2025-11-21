'use client';

import React, { useState, useMemo, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, ExternalLink, WifiOff, ServerCrash, Trophy, Lock, Sparkles, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { QuizAttempt } from '@/ai/schemas';
import { useAuth } from '@/context/AuthProvider';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { normalizeTimestamp } from '@/lib/dates';
import { EmptyState } from '../EmptyState';
import LoginPrompt from '../auth/LoginPrompt';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ✅ Map quiz FORMAT to Firebase cube adSlot
const FORMAT_TO_AD_SLOT: Record<string, string> = {
  'IPL': 'IPL',
  'T20': 'T20',
  'Test': 'Test',
  'ODI': 'ODI',
  'WPL': 'WPL',
  'Mixed': 'Mixed'
};

interface AdData {
  id: string;
  companyName: string;
  mediaUrl: string;
  redirectUrl: string;
  adSlot: string;
}

const ScratchCardSkeleton = () => (
  <div className="w-full aspect-[3/4] p-1">
    <Skeleton className="w-full h-full rounded-xl bg-muted/50" />
  </div>
);

const RewardsSkeleton = () => (
  <div className="space-y-6">
    <section>
      <h2 className="text-xl font-semibold text-foreground">🎁 Man of the Match Awards</h2>
      <p className="text-sm text-muted-foreground mb-4">A special award for every match you play. Claim your prize!</p>
      <Carousel opts={{ align: 'start' }} className="w-full max-w-full">
        <CarouselContent className="-ml-2">
          {[...Array(3)].map((_, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <ScratchCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  </div>
);

const ErrorStateDisplay = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mt-4">
    {message.includes("offline") || message.includes("network") ? <WifiOff className="h-4 w-4" /> : <ServerCrash className="h-4 w-4" />}
    <AlertTitle>Error Loading Rewards</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const ScratchCard = memo(({ ad, onScratch, isScratched, onDelete }: { 
  ad: AdData, 
  onScratch: () => void, 
  isScratched: boolean,
  onDelete: () => void 
}) => {
  return (
    <div className="w-full aspect-[3/4] p-1 relative">
      {/* DELETE BUTTON */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
        aria-label="Delete scratch card"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Card className={cn(
        "p-0 overflow-hidden shadow-lg relative w-full h-full rounded-xl transition-all duration-500 border-2",
        isScratched
          ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-900 border-amber-300 dark:border-amber-700"
          : "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 border-yellow-500 dark:border-yellow-600"
      )}>
        {!isScratched ? (
          <button 
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-95 rounded-xl p-3 text-center group" 
            onClick={onScratch} 
            role="button" 
            aria-label={`Scratch to reveal reward from ${ad.companyName}`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 relative mb-2 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white animate-pulse" />
            </div>
            <p className="font-bold text-sm sm:text-base text-white drop-shadow-lg">Scratch to Reveal</p>
            <p className="text-xs text-white/90 mt-1">Your Reward Awaits</p>
          </button>
        ) : (
          <div className="h-full flex flex-col items-center justify-between p-3 text-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md overflow-hidden flex-shrink-0 mt-2">
              <Image
                src={ad.mediaUrl}
                alt={ad.companyName}
                fill
                sizes="(max-width: 640px) 56px, 64px"
                className="object-contain p-2"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                }}
              />
            </div>
            <div className="flex-grow flex flex-col items-center justify-center py-2">
              <Trophy className="h-7 w-7 sm:h-8 sm:w-8 mb-1 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-100 line-clamp-2">{ad.companyName}</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Exclusive Partner Offer</p>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(ad.redirectUrl, '_blank', 'noopener,noreferrer');
              }} 
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white w-full shadow-lg text-xs py-2 h-8" 
              size="sm" 
              type="button"
            >
              Claim Now
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
});
ScratchCard.displayName = 'ScratchCard';

function RewardsContentComponent() {
  const { user, quizHistory, loading: authLoading } = useAuth();
  const [scratchedCards, setScratchedCards] = useState<Record<string, boolean>>({});
  const [rewardAds, setRewardAds] = useState<AdData[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);

  // ✅ FIXED: Get the latest 3 unique quiz formats
  const latestQuizFormats = useMemo(() => {
    if (!user || quizHistory.data.length === 0) return [];

    // Sort by timestamp (most recent first)
    const sortedAttempts = [...quizHistory.data].sort((a, b) => {
      const timeA = normalizeTimestamp(a.timestamp)?.getTime() || 0;
      const timeB = normalizeTimestamp(b.timestamp)?.getTime() || 0;
      return timeB - timeA; // Descending order (newest first)
    });

    // Take up to 3 most recent with UNIQUE formats
    const seen = new Set<string>();
    const formats: string[] = [];
    
    for (const attempt of sortedAttempts) {
      if (attempt.format && !seen.has(attempt.format)) {
        seen.add(attempt.format);
        formats.push(attempt.format);
      }
      if (formats.length === 3) break;
    }

    console.log('✅ LATEST 3 UNIQUE QUIZ FORMATS:', formats);
    return formats;
  }, [quizHistory.data, user]);

  // ✅ Fetch ads for all latest 3 formats
  useEffect(() => {
    const fetchRewardAds = async () => {
      if (!user || latestQuizFormats.length === 0) {
        console.log('❌ No user or no quiz formats to fetch ads for');
        setRewardAds([]);
        setAdsLoading(false);
        return;
      }

      try {
        setAdsLoading(true);
        
        const fetchedAds: AdData[] = [];
        
        // Loop through latest 3 quiz formats
        for (const format of latestQuizFormats) {
          const adSlot = FORMAT_TO_AD_SLOT[format];
          
          if (!adSlot) {
            console.warn(`⚠️ No ad slot mapping for format: ${format}`);
            continue;
          }

          console.log(`🔍 Fetching ad for format: ${format} → slot: ${adSlot}`);

          const adsQuery = query(
            collection(db, 'ads'),
            where('adSlot', '==', adSlot),
            where('isActive', '==', true),
            limit(1)
          );
          
          const snapshot = await getDocs(adsQuery);
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const adData = {
              id: doc.id,
              ...doc.data()
            } as AdData;
            
            console.log(`✅ Found ad for ${format}:`, adData.companyName);
            fetchedAds.push(adData);
          } else {
            console.warn(`⚠️ No ad found for slot: ${adSlot}`);
          }
        }
        
        console.log(`✅ Total ads fetched: ${fetchedAds.length}`);
        setRewardAds(fetchedAds);
      } catch (error) {
        console.error('❌ Error fetching reward ads:', error);
        setRewardAds([]);
      } finally {
        setAdsLoading(false);
      }
    };

    fetchRewardAds();
  }, [user, latestQuizFormats]);

  // Load scratched state from localStorage
  useEffect(() => {
    if (user && typeof window !== 'undefined' && rewardAds.length > 0) {
      const initialScratchedState: Record<string, boolean> = {};
      rewardAds.forEach(ad => {
        const storageKey = `indcric-scratch-${user.uid}-${ad.id}`;
        const savedState = window.localStorage.getItem(storageKey);
        if (savedState === 'true') {
          initialScratchedState[ad.id] = true;
        }
      });
      setScratchedCards(initialScratchedState);
    }
  }, [rewardAds, user]);

  const handleScratch = (adId: string) => {
    setScratchedCards(prev => ({ ...prev, [adId]: true }));
    if (typeof window !== 'undefined' && user) {
      const storageKey = `indcric-scratch-${user.uid}-${adId}`;
      window.localStorage.setItem(storageKey, 'true');
    }
  };

  // DELETE HANDLER
  const handleDelete = (adId: string) => {
    console.log('🗑️ Deleting scratch card:', adId);
    setRewardAds(prev => prev.filter(ad => ad.id !== adId));
    if (typeof window !== 'undefined' && user) {
      const storageKey = `indcric-scratch-${user.uid}-${adId}`;
      window.localStorage.removeItem(storageKey);
    }
    setScratchedCards(prev => {
      const newState = { ...prev };
      delete newState[adId];
      return newState;
    });
    console.log('✅ Scratch card deleted successfully');
  };

  const RewardCards = () => {
    if (authLoading || adsLoading) return <RewardsSkeleton />;
    if (quizHistory.error) return <ErrorStateDisplay message={quizHistory.error} />;

    if (!user) {
      return (
        <div className="pt-8">
          <LoginPrompt 
            icon={Lock}
            title="Unlock Your Rewards"
            description="Your scratch cards are waiting! Sign in to reveal exclusive partner offers."
          />
        </div>
      );
    }
    
    if (rewardAds.length === 0) {
      return (
        <EmptyState
          Icon={Gift}
          title="No Rewards Yet"
          description="Play a quiz to unlock your first scratch card!"
        />
      );
    }

    return (
      <div className="relative pb-6">
        <Carousel opts={{ align: 'start' }} className="w-full max-w-full">
          <CarouselContent className="-ml-2">
            {rewardAds.map((ad, index) => (
              <CarouselItem key={`${ad.id}-${index}`} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <ScratchCard 
                  ad={ad}
                  isScratched={scratchedCards[ad.id] || false}
                  onScratch={() => handleScratch(ad.id)}
                  onDelete={() => handleDelete(ad.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="sm:hidden flex justify-center mt-4 gap-2">
            <CarouselPrevious className="relative static" />
            <CarouselNext className="relative static" />
          </div>
        </Carousel>
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">🎁 Man of the Match Awards</h2>
      <p className="text-sm text-muted-foreground mb-4">A special award for every match you play. Claim your prize!</p>
      <RewardCards />
    </section>
  );
}

const RewardsContent = memo(RewardsContentComponent);
export default RewardsContent;
