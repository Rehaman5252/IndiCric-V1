'use client';

import React, { memo } from 'react';
import GlobalStats from '@/components/home/global-stats';
import QuizSelection from '@/components/home/quiz-selection';
import SelectedBrandCard from '@/components/home/selected-brand-card';
import { CubeBrand } from '@/hooks/use-brand-ads';

interface HomeClientContentProps {
    brands: CubeBrand[];
    selectedBrand: CubeBrand | null;
    setSelectedBrand: (brand: CubeBrand) => void;
    handleStartQuiz: (brand: CubeBrand) => void;
}

function HomeClientContent({ brands, selectedBrand, setSelectedBrand, handleStartQuiz }: HomeClientContentProps) {
    return (
        <>
            <GlobalStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <QuizSelection
                    brands={brands}
                    onBrandSelect={setSelectedBrand}
                />
                
                {selectedBrand && (
                    <SelectedBrandCard 
                        brand={selectedBrand}
                        onPlayNow={() => handleStartQuiz(selectedBrand)}
                    />
                )}
            </div>
        </>
    );
}

export default memo(HomeClientContent);