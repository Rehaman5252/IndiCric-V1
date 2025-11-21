'use client';

import { useEffect, useState } from 'react';
import { getAdForSlot, Ad } from '@/lib/simple-ads';
import { AdSlot } from '@/lib/ad-service';
import Image from 'next/image';

interface AdSlotDisplayProps {
  slot: AdSlot | undefined | null;
  userId: string;
  className?: string;
}

export default function AdSlotDisplay({ slot, userId, className = '' }: AdSlotDisplayProps) {
  if (!slot || !userId) {
    console.warn('⚠️ [AdSlotDisplay] No slot or userId:', { slot, userId });
    return null;
  }

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  async function loadAd() {
    try {
      setLoading(true);
      setError(null);
      const loadedAd = await getAdForSlot(slot); // Await the result!
      if (loadedAd) {
        setAd(loadedAd);
      } else {
        setError(`No ad found for ${slot}`);
        setAd(null);
      }
    } catch (err) {
      setError(String(err));
      setAd(null);
    } finally {
      setLoading(false);
    }
  }
  loadAd();
}, [slot]);


  const handleAdClick = () => {
    if (ad) {
      console.log(`[AdSlotDisplay] 👆 Ad clicked:`, ad.title);
    }
  };

  if (loading) {
    return (
      <div className={`${className} bg-gray-800 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-400 text-sm">Loading ad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-900 rounded-lg flex items-center justify-center p-4`}>
        <p className="text-red-200 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className={`${className} bg-gray-800 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-400 text-sm">No ad available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative group bg-black rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={handleAdClick}
    >
      <Image
        src={ad.url}
        alt={ad.title}
        fill
        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
        priority
        onError={(e) => console.error(`[AdSlotDisplay] Image load error:`, ad.url, e)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white font-bold text-sm">{ad.title}</p>
      </div>

      <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
        {slot}
      </div>
    </div>
  );
}