import { useEffect, useState } from 'react';
import { getAdsBySlot, Ad } from '@/lib/ad-service';

export function useFormatAd(format: string) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      if (!format) {
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 Fetching ad for format: ${format}`);
        const ads = await getAdsBySlot(format as any);
        
        if (ads.length > 0) {
          setAd(ads[0]);
          console.log(`✅ Ad found: ${ads[0].companyName}`);
        } else {
          console.log(`⚠️ No ad for format: ${format}`);
          setAd(null);
        }
      } catch (error) {
        console.error(`❌ Error fetching ad:`, error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [format]);

  return { ad, loading };
}
