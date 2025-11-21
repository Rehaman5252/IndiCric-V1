// FILE 2: Section 14 - app/components/quiz/InterstitialLoader.tsx
// ============================================================================
// REPLACE EVERYTHING IN THIS FILE

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

interface InterstitialLoaderProps {
  logoUrl: string; // This MUST be from Firebase mediaUrl, NOT a hardcoded SVG
  logoHint: string; // Company name from Firebase
  duration?: number; // in ms
  onComplete: () => void;
}

export default function InterstitialLoader({
  logoUrl,
  logoHint,
  duration = 2000,
  onComplete,
}: InterstitialLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progressValue = Math.min(100, (elapsedTime / duration) * 100);
      
      setProgress(progressValue);

      if (elapsedTime >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Ad Image */}
      <div className="w-48 h-24 relative mb-4">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={logoHint || 'Advertisement'}
            fill
            className="object-contain"
            data-ai-hint={logoHint}
            priority
            onError={(e) => console.error('Image load error:', logoUrl)}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading ad...</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-64 max-w-xs">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Label */}
      <p className="text-gray-400 text-xs mt-3">{logoHint || 'Advertisement'}</p>
    </div>
  );
}