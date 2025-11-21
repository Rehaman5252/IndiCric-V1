// FILE 1: Section 10 - lib/ads.ts (or lib/simple-ads.ts)
// ============================================================================
// REPLACE EVERYTHING IN THIS FILE

import { AdSlot } from '@/lib/ad-service';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Ad {
  type: 'image' | 'video';
  url: string;
  title: string;
  duration: number;
  skippableAfter: number;
  hint?: string;
  companyName: string;
  adSlot: AdSlot;
  isActive: boolean;
  mediaUrl?: string;
  redirectUrl?: string;
}

// Interface for interstitial ads
export interface InterstitialAdConfig {
  type: 'static' | 'video';
  logoUrl?: string;
  logoHint?: string;
  durationMs?: number;
  videoUrl?: string;
  videoTitle?: string;
  durationSec?: number;
  skippableAfterSec?: number;
}

// ✅ FETCH AD FROM FIRESTORE BY SLOT
export async function getAdForSlot(slot: AdSlot | null | undefined): Promise<Ad | null> {
  try {
    if (!slot) {
      console.warn('⚠️ [getAdForSlot] No slot provided');
      return null;
    }

    console.log(`🔍 [getAdForSlot] Fetching from Firebase for slot: ${slot}`);

    // Query Firestore for active ads matching this slot
    const q = query(
      collection(db, 'ads'),
      where('adSlot', '==', slot),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`⚠️ [getAdForSlot] No ads found in Firebase for slot: ${slot}`);
      return null;
    }

    // Get first ad from results
    const docData = snapshot.docs[0].data();
    
    const ad: Ad = {
      type: docData.adType || 'image',
      url: docData.mediaUrl || '', // Use mediaUrl from Firebase
      title: docData.companyName || 'Ad',
      duration: 5,
      skippableAfter: 2,
      companyName: docData.companyName || '',
      adSlot: slot,
      isActive: docData.isActive || true,
      mediaUrl: docData.mediaUrl,
      redirectUrl: docData.redirectUrl,
    };

    console.log(`✅ [getAdForSlot] Ad found from Firebase:`, ad.companyName, ad.mediaUrl);
    return ad;
  } catch (error) {
    console.error('❌ [getAdForSlot] Error fetching from Firebase:', error);
    return null;
  }
}

// ✅ GET INTERSTITIAL AD (static loader between questions) - NOW FETCHES FROM FIREBASE
export async function getInterstitialAdForSlot(slot: AdSlot | null | undefined): Promise<InterstitialAdConfig | null> {
  try {
    if (!slot) {
      console.warn('⚠️ [getInterstitialAdForSlot] No slot provided');
      return null;
    }

    console.log(`🔍 [getInterstitialAdForSlot] Fetching interstitial ad for slot: ${slot}`);

    // Fetch the actual ad from Firebase
    const ad = await getAdForSlot(slot);

    if (!ad) {
      console.warn(`⚠️ [getInterstitialAdForSlot] No ad found for slot: ${slot}`);
      return null;
    }

    // Convert to interstitial config
    const interstitialConfig: InterstitialAdConfig = {
      type: 'static',
      logoUrl: ad.mediaUrl, // ✅ Use Firebase mediaUrl instead of hardcoded SVG
      logoHint: ad.companyName, // ✅ Use company name from Firebase
      durationMs: 2000,
    };

    console.log(`✅ [getInterstitialAdForSlot] Interstitial ad config:`, interstitialConfig);
    return interstitialConfig;
  } catch (error) {
    console.error('❌ [getInterstitialAdForSlot] Error:', error);
    return null;
  }
}