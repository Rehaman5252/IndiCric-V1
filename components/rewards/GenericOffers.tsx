'use client';

import React, { useState, useEffect, memo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  companyName: string;
  mediaUrl: string;
  redirectUrl: string;
  adSlot: string;
  isActive: boolean;
}

const AdCardSkeleton = () => (
  <div className="h-20 rounded-lg overflow-hidden">
    <Skeleton className="w-full h-full bg-muted/50" />
  </div>
);

const GenericOffersComponent = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizFlowAds = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching Quiz Flow ads...');
        
        // ✅ FIXED: Query for ONLY active ads, then filter client-side
        const adsQuery = query(
          collection(db, 'ads'),
          where('isActive', '==', true)
        );
        
        const snapshot = await getDocs(adsQuery);
        const allAds = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Ad));

        console.log('📊 All active ads from Firebase:', allAds);
        console.log('📊 All ad slots:', allAds.map(ad => ({ name: ad.companyName, slot: ad.adSlot })));

        // ✅ FIXED: Exclude ONLY cube face ads (IPL, T20, Test, ODI, WPL, Mixed)
        // Everything else is a Quiz Flow ad
        const CUBE_SLOTS = ['IPL', 'T20', 'Test', 'ODI', 'WPL', 'Mixed'];
        
        const quizFlowAds = allAds.filter(ad => {
          // Must have adSlot field
          if (!ad.adSlot) {
            console.warn('⚠️ Ad missing adSlot:', ad.companyName);
            return false;
          }

          // Exclude cube face ads
          const isCubeAd = CUBE_SLOTS.includes(ad.adSlot);
          
          console.log(`🔍 Checking ${ad.companyName} (slot: ${ad.adSlot}): ${isCubeAd ? 'CUBE AD - EXCLUDE' : 'QUIZ FLOW AD - INCLUDE'}`);
          
          return !isCubeAd;
        });
        
        console.log('✅ Quiz Flow Ads (filtered):', quizFlowAds);
        console.log('✅ Quiz Flow Ad names:', quizFlowAds.map(ad => ad.companyName));
        setAds(quizFlowAds);
      } catch (error) {
        console.error('❌ Error fetching quiz flow ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizFlowAds();
  }, []);

  const handleAdClick = (redirectUrl: string, companyName: string) => {
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    console.log(`Quiz Flow Ad clicked: ${companyName} -> ${redirectUrl}`);
  };

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">🎯 Partner Offers</h2>
        <p className="text-sm text-muted-foreground mb-4">Exclusive deals from our sponsors</p>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <AdCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-foreground">🎯 Partner Offers</h2>
        <p className="text-sm text-muted-foreground mb-4">No active offers at the moment</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-foreground">🎯 Partner Offers</h2>
      <p className="text-sm text-muted-foreground mb-4">Exclusive deals from our sponsors</p>
      
      <div className="space-y-3">
        {ads.map((ad) => (
          <button
            key={ad.id}
            onClick={() => handleAdClick(ad.redirectUrl, ad.companyName)}
            className="w-full bg-card/50 hover:bg-card/80 border border-border rounded-lg p-3 flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-md group cursor-pointer"
            aria-label={`View offer from ${ad.companyName}`}
          >
            {/* Company Logo */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg bg-muted overflow-hidden">
              <Image
                src={ad.mediaUrl}
                alt={ad.companyName}
                fill
                sizes="(max-width: 640px) 48px, 56px"
                className="object-contain p-2"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                }}
              />
            </div>

            {/* Company Info */}
            <div className="flex-grow text-left">
              <p className="font-semibold text-sm sm:text-base text-foreground">{ad.companyName}</p>
              <p className="text-xs text-muted-foreground">Tap to view exclusive offer</p>
            </div>

            {/* External Link Icon */}
            <ExternalLink className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
};

const GenericOffers = memo(GenericOffersComponent);
export default GenericOffers;
