'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdFinished: () => void;
  duration: number;
  skippableAfter: number;
  adTitle: string;
  adType: 'image' | 'video';
  adUrl: string;
  adHint?: string;
  children?: React.ReactNode;
}

export function AdDialog({
  open,
  onOpenChange,
  onAdFinished,
  duration,
  skippableAfter,
  adTitle,
  adType,
  adUrl,
  adHint,
  children
}: AdDialogProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ AUTO-DETECT: If URL has .mp4, it's a VIDEO, not image
  const isVideoUrl = adUrl?.toLowerCase().includes('.mp4') || 
                     adUrl?.toLowerCase().includes('.webm') || 
                     adUrl?.toLowerCase().includes('.video');
  const finalAdType = isVideoUrl ? 'video' : 'image';

  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current);
      setVideoLoaded(false);
      setIsPlaying(false);
      return;
    }

    console.log(`📺 [AdDialog] OPENING: Type=${finalAdType}, Duration=${duration}s, Skip after=${skippableAfter}s`);

    setTimeRemaining(duration);
    setCanSkip(false);
    setVideoError(false);
    setVideoLoaded(false);
    setIsPlaying(false);

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (newTime === skippableAfter) {
          console.log(`✅ [AdDialog] Skip button enabled after ${skippableAfter}s`);
          setCanSkip(true);
        }

        if (newTime <= 0) {
          console.log(`⏱️ [AdDialog] Duration complete, finishing ad`);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => onAdFinished(), 100);
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, duration, skippableAfter, finalAdType, onAdFinished]);

  // Auto-play video when loaded
  useEffect(() => {
    if (videoLoaded && videoRef.current && finalAdType === 'video' && !isPlaying) {
      console.log(`▶️ [AdDialog] Auto-playing video...`);
      videoRef.current.play()
        .then(() => {
          console.log(`✅ [AdDialog] Video playing!`);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn(`⚠️ [AdDialog] Play failed (likely autoplay policy):`, err);
          setIsPlaying(true); // Still mark as playing, timer will finish it
        });
    }
  }, [videoLoaded, finalAdType, isPlaying]);

  const handleSkip = () => {
    if (!canSkip) return;
    console.log(`⏭️ [AdDialog] User skipped ad`);
    if (timerRef.current) clearInterval(timerRef.current);
    onAdFinished();
  };

  const handleVideoEnded = () => {
    console.log(`✅ [AdDialog] Video ended naturally`);
    if (timerRef.current) clearInterval(timerRef.current);
    onAdFinished();
  };

  const handleVideoError = (e: any) => {
    console.error(`❌ [AdDialog] Video error:`, e);
    setVideoError(true);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      onAdFinished();
    }, 2000);
  };

  const handleVideoCanPlay = () => {
    console.log(`🎬 [AdDialog] Video can play`);
    setVideoLoaded(true);
  };

  const handleImageLoad = () => {
    console.log(`🖼️ [AdDialog] Image loaded`);
    setVideoLoaded(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-black border-0 rounded-lg overflow-hidden">
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          
          {/* VIDEO PLAYER */}
          {finalAdType === 'video' ? (
            <>
              {/* Loading spinner for video */}
              {!videoLoaded && !videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black z-10">
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                  <p className="text-white text-sm">Loading video...</p>
                </div>
              )}

              {/* Error state */}
              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900 z-10">
                  <p className="text-red-500 font-semibold">Unable to load video</p>
                  <p className="text-gray-400 text-sm">Proceeding in {timeRemaining}s...</p>
                </div>
              )}

              {/* ✅ PROPER VIDEO ELEMENT - NOT Next.js Image! */}
              <video
                ref={videoRef}
                src={adUrl}
                preload="auto"
                playsInline
                muted={false}
                controls={false}
                onCanPlay={handleVideoCanPlay}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                className={`w-full h-full object-cover ${videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                style={{ display: videoError ? 'none' : 'block' }}
              />
            </>
          ) : (
            /* IMAGE DISPLAY */
            <>
              {videoError ? (
                <div className="flex items-center justify-center text-red-500">
                  Unable to load image
                </div>
              ) : (
                <img
                  src={adUrl}
                  alt={adTitle}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error(`❌ [AdDialog] Image load error`);
                    setVideoError(true);
                  }}
                  onLoad={handleImageLoad}
                />
              )}
            </>
          )}

          {/* Overlay with title, timer, and skip button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 flex flex-col justify-between p-6 z-20">
            {/* Title at top */}
            <div>
              <h3 className="text-white font-bold text-xl drop-shadow-lg">{adTitle}</h3>
              {adHint && <p className="text-gray-200 text-sm mt-1 drop-shadow-md">{adHint}</p>}
            </div>

            {/* Timer and Skip button at bottom */}
            <div className="flex justify-between items-end">
              <div className="text-white font-bold text-2xl bg-black/80 px-4 py-2 rounded-lg min-w-[70px] text-center shadow-xl">
                {timeRemaining}s
              </div>

              <Button
                onClick={handleSkip}
                disabled={!canSkip}
                className={`px-8 py-3 font-bold text-base rounded-lg transition-all shadow-xl ${
                  canSkip
                    ? 'bg-white text-black hover:bg-gray-100 cursor-pointer scale-100 hover:scale-105'
                    : 'bg-gray-700/80 text-gray-400 cursor-not-allowed opacity-70'
                }`}
              >
                {canSkip ? 'Skip Ad →' : `Skip in ${Math.max(0, skippableAfter - (duration - timeRemaining))}s`}
              </Button>
            </div>
          </div>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default AdDialog;