import { AdSlot } from '@/lib/ad-service';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// ✅ UNIFIED AD INTERFACE - MATCHES lib/ad-service.ts
export interface Ad {
  id: string;
  companyName: string;
  adSlot: AdSlot;
  adType: 'image' | 'video';
  mediaUrl: string;
  redirectUrl: string;
  revenue: number;
  viewCount: number;
  clickCount: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
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


// ✅ FETCH AD FROM FIRESTORE BY SLOT - RETURNS FULL Ad OBJECT
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
    const doc = snapshot.docs[0];
    const docData = doc.data();


    // ✅ BUILD FULL Ad OBJECT WITH ALL REQUIRED FIELDS (INCLUDING id!)
    const ad: Ad = {
      id: doc.id, // ✅ IMPORTANT: Get id from document
      companyName: docData.companyName || '',
      adSlot: docData.adSlot,
      adType: docData.adType || 'image',
      mediaUrl: docData.mediaUrl || '',
      redirectUrl: docData.redirectUrl || '',
      revenue: docData.revenue || 0,
      viewCount: docData.viewCount || 0,
      clickCount: docData.clickCount || 0,
      isActive: docData.isActive || true,
      createdAt: docData.createdAt,
      updatedAt: docData.updatedAt,
    };


    console.log(`✅ [getAdForSlot] Ad found from Firebase:`, ad.companyName, ad.mediaUrl);
    return ad;
  } catch (error) {
    console.error('❌ [getAdForSlot] Error fetching from Firebase:', error);
    return null;
  }
}


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

    // Detect if ad is video or image
    const isVideo = ad.adType === 'video' || ad.mediaUrl.toLowerCase().includes('.mp4');

    console.log(`🎬 [getInterstitialAdForSlot] Ad type detected: ${isVideo ? 'VIDEO' : 'IMAGE'}`);

    // Set default duration: 40 seconds for video, 10 seconds for image
    const durationSec = isVideo ? 40 : 10;
    const durationMs = durationSec * 1000;

    // Set skip button availability: 15 seconds for Q3 and Q4 slots, otherwise last 5 seconds
    let skippableAfterSec: number;

    const slotStr = String(slot);
if (slotStr === "Q3" || slotStr === "Q4") {
  skippableAfterSec = 20;
} else {
  skippableAfterSec = Math.max(5, durationSec - 5);
}


    // Convert to interstitial config
    const interstitialConfig: InterstitialAdConfig = {
      type: isVideo ? 'video' : 'static',
      logoUrl: !isVideo ? ad.mediaUrl : undefined,
      logoHint: ad.companyName,
      durationMs: durationMs,
      durationSec: durationSec,
      videoUrl: isVideo ? ad.mediaUrl : undefined,
      videoTitle: ad.companyName,
      skippableAfterSec: skippableAfterSec,
    };

    console.log(`✅ [getInterstitialAdForSlot] Interstitial ad config:`, {
      type: interstitialConfig.type,
      duration: `${durationSec}s (${durationMs}ms)`,
      hasVideo: !!interstitialConfig.videoUrl,
      hasLogo: !!interstitialConfig.logoUrl,
      skippableAfterSec: skippableAfterSec,
    });

    return interstitialConfig;
  } catch (error) {
    console.error('❌ [getInterstitialAdForSlot] Error:', error);
    return null;
  }
}
