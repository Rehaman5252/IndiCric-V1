'use client';

import React, { useEffect, useState } from 'react';
import { getAdBySlot, logAdView, logAdClick, type AdSlot, type Ad } from '@/lib/ad-service';
import Image from 'next/image';

interface AdSlotDisplayProps {
  slot: AdSlot;
  userId: string;
  className?: string;
}

export default function AdSlotDisplay({ slot, userId, className = '' }: AdSlotDisplayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLogged, setViewLogged] = useState(false);

  useEffect(() => {
    const loadAd = async () => {
      try {
        const fetchedAd = await getAdBySlot(slot);
        if (fetchedAd) {
          setAd(fetchedAd);

          // Log view automatically once when ad loads
          if (!viewLogged) {
            try {
              await logAdView(fetchedAd.id, userId, slot, fetchedAd.companyName);
              setViewLogged(true);
            } catch (err) {
              console.error('Error logging view:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [slot, userId, viewLogged]);

  const handleAdClick = async () => {
    if (ad) {
      try {
        await logAdClick(ad.id, userId, slot, ad.companyName);
        window.open(ad.redirectUrl, '_blank');
      } catch (error) {
        console.error('Error logging click:', error);
        window.open(ad.redirectUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 animate-pulse rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full bg-gray-700" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">No ad available for this slot</p>
      </div>
    );
  }

  return (
    <div
      onClick={handleAdClick}
      className={`relative rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-lg ${className}`}
    >
      {ad.adType === 'image' && (
        <Image
          src={ad.mediaUrl}
          alt={ad.companyName}
          fill
          className="object-cover"
          priority
        />
      )}
      
      {ad.adType === 'video' && (
        <video
          src={ad.mediaUrl}
          controls
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition" />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white">
        <p className="font-semibold text-sm">{ad.companyName}</p>
        <p className="text-xs text-gray-300">Views: {ad.viewCount || 0} | Clicks: {ad.clickCount || 0}</p>
      </div>
    </div>
  );
}
