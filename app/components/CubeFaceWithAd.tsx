'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAdsBySlot, Ad, logAdView } from '@/lib/ad-service';
import { motion } from 'framer-motion';

interface CubeFaceWithAdProps {
  format: string; // T20, IPL, ODI, WPL, Test, Mixed
  brand: string; // Amazon, Netflix, etc.
  onClick: () => void;
  userId: string;
  index: number;
}

export default function CubeFaceWithAd({
  format,
  brand,
  onClick,
  userId,
  index,
}: CubeFaceWithAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [adViewed, setAdViewed] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        console.log(`🔍 Fetching ad for cube face: ${format}`);
        const ads = await getAdsBySlot(format as any);

        if (ads.length > 0) {
          const selectedAd = ads[0];
          setAd(selectedAd);
          console.log(`✅ Cube ad found: ${selectedAd.companyName} (${format})`);

          // Log view
          if (!adViewed && userId) {
            await logAdView(selectedAd.id, userId, format, selectedAd.companyName);
            setAdViewed(true);
          }
        } else {
          console.log(`⚠️ No ad for format: ${format}, showing default brand`);
          setAd(null);
        }
      } catch (error) {
        console.error(`❌ Error fetching ad for ${format}:`, error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [format, userId, adViewed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg">
        
        {/* AD IMAGE (if available) */}
        {ad && ad.mediaUrl && (
          <>
            <Image
              src={ad.mediaUrl}
              alt={ad.companyName}
              fill
              className="w-full h-full object-cover"
              priority={index === 0}
              onError={(e) => {
                console.error(`❌ Failed to load ad image for ${format}`);
              }}
            />
            {/* Overlay with company name */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <p className="text-white font-bold text-sm">{ad.companyName}</p>
              <p className="text-yellow-400 text-xs font-semibold">{format}</p>
            </div>
          </>
        )}

        {/* FALLBACK: Brand Logo (if no ad) */}
        {!ad && !loading && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-800">
            <div className="text-3xl font-bold text-yellow-500">{brand[0]}</div>
            <p className="text-white text-sm font-semibold">{brand}</p>
            <p className="text-gray-400 text-xs">{format}</p>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Format Badge */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          {format}
        </div>
      </div>
    </motion.div>
  );
}
