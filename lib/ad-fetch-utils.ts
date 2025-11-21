import { getAdsBySlot, AdSlot } from './ad-service';

// Map quiz format to ad slot
export const formatToAdSlotMap: Record<string, AdSlot> = {
  'T20': 'T20',
  'IPL': 'IPL',
  'ODI': 'ODI',
  'WPL': 'WPL',
  'Test': 'Test',
  'Mixed': 'Mixed',
};

// Fetch ad by quiz format (for cube faces)
export async function getAdByFormat(format: string) {
  try {
    if (!format) {
      console.warn('⚠️ [getAdByFormat] No format provided');
      return null;
    }

    const slot = formatToAdSlotMap[format];
    if (!slot) {
      console.warn(`⚠️ [getAdByFormat] No ad slot mapping for format: ${format}`);
      return null;
    }
    
    console.log(`[getAdByFormat] 🔍 Fetching ad for format: ${format} -> slot: ${slot}`);
    const ads = await getAdsBySlot(slot);
    
    if (ads.length > 0) {
      console.log(`✅ [getAdByFormat] Ad found for ${format}:`, ads[0]);
      return ads[0];
    } else {
      console.log(`⚠️ [getAdByFormat] No ads for slot: ${slot}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ [getAdByFormat] Error:`, error);
    return null;
  }
}

// Fetch ad by question slot (between questions)
export async function getAdByQuestionSlot(slot: AdSlot | undefined | null) {
  try {
    // ✅ DEFENSIVE CHECK
    if (!slot) {
      console.warn(`⚠️ [getAdByQuestionSlot] Invalid slot:`, slot);
      return null;
    }

    console.log(`[getAdByQuestionSlot] 🔍 Fetching ad for question slot: ${slot}`);
    const ads = await getAdsBySlot(slot);
    
    if (ads.length > 0) {
      console.log(`✅ [getAdByQuestionSlot] Ad found for ${slot}:`, ads[0]);
      return ads[0];
    } else {
      console.log(`⚠️ [getAdByQuestionSlot] No ads for slot: ${slot}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ [getAdByQuestionSlot] Error:`, error);
    return null;
  }
}
