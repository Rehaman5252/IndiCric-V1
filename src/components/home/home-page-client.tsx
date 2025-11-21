'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { memo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useQuizStatus } from '@/providers/quiz-status-provider';
import { useToast } from '@/hooks/use-toast';
import type { CubeBrand } from '@/hooks/use-brand-ads';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import HomeContentSkeleton from './home-content-skeleton';
import { useBrandAds } from '@/hooks/use-brand-ads';

const CricketFact = dynamic(() => import('@/components/home/cricket-fact'), {
    loading: () => <Skeleton className="h-40 w-full" />,
});

const HomeClientContent = dynamic(() => import('@/components/home/home-client-content').catch(e => {
    console.error("Failed to load HomeClientContent chunk", e);
    return function ChunkLoadFallback() {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>
                    There was a problem loading this feature. Please check your connection and try again.
                </AlertDescription>
            </Alert>
        );
    }
}), { 
    loading: () => <HomeContentSkeleton />,
    ssr: false 
});

const StartQuizButton = dynamic(() => import('@/components/home/start-quiz-button'), {
    loading: () => <Skeleton className="h-12 w-full rounded-full" />,
});


const MalpracticeWarning = memo(() => {
    const { profile } = useAuth();
    if (!profile) return null;

    const noBallCount = profile.noBallCount || 0;
    if (noBallCount <= 0 || noBallCount >= 3) return null;

    const today = new Date().setHours(0, 0, 0, 0);
    
    const lastNoBallDay = profile.lastNoBallTimestamp 
        ? profile.lastNoBallTimestamp.toDate().setHours(0, 0, 0, 0) 
        : null;

    if (lastNoBallDay !== today) return null;

    const warningsLeft = 3 - noBallCount;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fair Play Warning!</AlertTitle>
                <AlertDescription>
                    You have {noBallCount} No-Ball(s) today. {warningsLeft} more and you're Out for the Day! Please contact support to appeal.
                </AlertDescription>
            </Alert>
        </motion.div>
    );
});
MalpracticeWarning.displayName = 'MalpracticeWarning';

function HomePageClient() {
    const { user, isProfileComplete, lastAttemptInSlot, loading: authLoading } = useAuth();
    const { isLoading: isQuizStatusLoading } = useQuizStatus();
    const { brands, loading: brandsLoading, error: brandsError } = useBrandAds();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedBrand, setSelectedBrand] = useState<CubeBrand | null>(null);

    const hasPlayedInCurrentSlot = !!lastAttemptInSlot;

    // Effect to set the initial selected brand once data is loaded
    React.useEffect(() => {
        if (!selectedBrand && brands.length > 0) {
            setSelectedBrand(brands[0]);
        }
    }, [brands, selectedBrand]);

    const handleStartQuiz = useCallback((brandToPlay?: CubeBrand) => {
        const brand = brandToPlay || selectedBrand;
        if (!brand) {
            toast.error("Please select a quiz format first.");
            return;
        }

        if (!user) {
            router.push(`/auth/login?from=/`);
            return;
        }
        
        if (hasPlayedInCurrentSlot && lastAttemptInSlot) {
            router.push(`/quiz/results?attemptId=${lastAttemptInSlot.slotId}`);
            toast.info("You've already played this innings!", {
                description: `Showing your results for the ${lastAttemptInSlot.format} quiz. You can only attempt one quiz per slot.`,
            });
            return;
        }

        if (!user.emailVerified) {
            toast.error("Email not verified", {
                description: "Please verify your email address before playing a quiz.",
            });
            return;
        }
        if (!isProfileComplete) {
            toast.error("Profile Incomplete", {
                description: "Please complete your profile to start playing quizzes.",
            });
            router.push('/profile');
            return;
        }
        
        router.push(`/quiz?brand=${encodeURIComponent(brand.brand)}&format=${encodeURIComponent(brand.format)}`);
    }, [user, hasPlayedInCurrentSlot, lastAttemptInSlot, isProfileComplete, selectedBrand, router, toast]);

    if (authLoading || brandsLoading) {
        return <HomeContentSkeleton />;
    }

    if (brandsError) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Quiz Data</AlertTitle>
                <AlertDescription>{brandsError}</AlertDescription>
            </Alert>
        )
    }
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
        >
            <MalpracticeWarning />
            
            <HomeClientContent 
                brands={brands}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                handleStartQuiz={handleStartQuiz}
            />
            
            <div className="mt-6">
                <StartQuizButton
                    brandFormat={hasPlayedInCurrentSlot && lastAttemptInSlot ? lastAttemptInSlot.format : selectedBrand?.format || ''}
                    onClick={() => handleStartQuiz()}
                    isDisabled={isQuizStatusLoading || !selectedBrand}
                    hasPlayed={hasPlayedInCurrentSlot}
                />
            </div>
            
            <div className="mt-8">
                <CricketFact format={selectedBrand?.format || 'cricket'} />
            </div>

        </motion.div>
    );
}

export default memo(HomePageClient);