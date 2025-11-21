// app/components/home/HomeClientContent.tsx
'use client';

import React, { memo } from 'react';
import { useAuth } from '@/context/AuthProvider';
// ✅ FIXED: Use @/ alias for imports
import type { CubeBrand } from '@/components/home/brandData';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const QuizSelection = dynamic(() => import('@/components/home/QuizSelection'), {
    loading: () => <Skeleton className="h-[450px] w-full" />,
    ssr: false
});

const GuidedTour = dynamic(() => import('@/components/home/GuidedTour'), { ssr: false });

interface HomeClientContentProps {
    selectedBrand: CubeBrand;
    setSelectedBrand: React.Dispatch<React.SetStateAction<CubeBrand>>;
    handleStartQuiz: (brand: CubeBrand) => void;
}

const HomeClientContentComponent = ({ selectedBrand, setSelectedBrand, handleStartQuiz }: HomeClientContentProps) => {
    const { profile, updateUserData } = useAuth();

    // ✅ FIXED: Ensure needsTour is always boolean, never null
    const needsTour = profile ? !profile.guidedTourCompleted : false;

    const handleTourFinish = async () => {
        if (profile) {
            try {
                await updateUserData({ guidedTourCompleted: true });
            } catch (error) {
                console.error("Failed to update tour status:", error);
            }
        }
    };
    
    return (
        <>
            <QuizSelection
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand} 
                handleStartQuiz={handleStartQuiz} 
            />
            {/* ✅ FIXED: needsTour is now always boolean */}
            {profile && <GuidedTour run={needsTour} onFinish={handleTourFinish} />}
        </>
    );
};

export default memo(HomeClientContentComponent);
