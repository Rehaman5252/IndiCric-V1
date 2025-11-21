'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdSlotDisplay from './AdSlotDisplay';
import { Ad } from '@/lib/ad-service';
import type { CubeBrand } from '@/lib/cubeBrandData';

interface BrandCubeWithAdProps {
  brand: CubeBrand;
  userId: string;
  onClick: () => void;
}

export default function BrandCubeWithAd({ brand, userId, onClick }: BrandCubeWithAdProps) {
  const [showAd, setShowAd] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);

  return (
    <div className="space-y-3 cursor-pointer" onClick={onClick}>
      {/* Brand Logo/Cube Face */}
      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center hover:shadow-lg transition-shadow">
        {brand.logoUrl && (
          <Image
            src={brand.logoUrl}
            alt={brand.brand}
            width={120}
            height={120}
            className="object-contain"
          />
        )}
      </div>

      {/* Brand Name & Format */}
      <div>
        <h3 className="font-bold text-white">{brand.brand}</h3>
        <p className="text-sm text-gray-400">{brand.format} Cricket</p>
      </div>

      {/* Ad for this brand format */}
      {userId && (
        <div className="pt-2">
          <AdSlotDisplay
            adSlot={brand.format as any}
            userId={userId}
            className="h-24 w-full rounded text-xs"
            onAdLoaded={(ad) => setAd(ad)}
          />
        </div>
      )}
    </div>
  );
}
