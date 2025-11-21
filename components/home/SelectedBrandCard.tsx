'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import type { CubeBrand } from './brandData';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdsBySlot } from '@/lib/ad-service';

interface SelectedBrandCardProps {
  selectedBrand: CubeBrand;
  onClick: () => void;
}

const SelectedBrandCardComponent = ({ selectedBrand, onClick }: SelectedBrandCardProps) => {
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>(selectedBrand.brand); // ✅ NEW: Store company name

  useEffect(() => {
    const fetchAdImage = async () => {
      try {
        console.log(`🔍 Fetching ad image for: ${selectedBrand.format}`);
        const ads = await getAdsBySlot(selectedBrand.format as any);
        
        if (ads.length > 0) {
          setAdImageUrl(ads[0].mediaUrl);
          setCompanyName(ads[0].companyName); // ✅ FIXED: Set real company name from Firebase
          console.log(`✅ Ad image found for ${selectedBrand.format} - Company: ${ads[0].companyName}`);
        } else {
          setAdImageUrl(null);
          setCompanyName(selectedBrand.brand); // ✅ Fallback to default brand
          console.log(`⚠️ No ad image for ${selectedBrand.format}, using logo`);
        }
      } catch (error) {
        console.error(`❌ Error fetching ad image:`, error);
        setAdImageUrl(null);
        setCompanyName(selectedBrand.brand); // ✅ Fallback on error
      }
    };

    fetchAdImage();
  }, [selectedBrand.format, selectedBrand.brand]);

  const displayImageUrl = adImageUrl || selectedBrand.logoUrl;

  return (
    <Card 
        className="rounded-2xl shadow-lg cursor-pointer bg-card/50 hover:bg-secondary/50 transition-colors duration-300 ease-in-out transform hover:-translate-y-1 border border-primary"
        onClick={onClick}
        role="button"
        aria-label={`Play ${selectedBrand.format} quiz`}
    >
        <CardContent className="px-4 py-4 sm:px-6 flex items-center justify-between gap-4 overflow-hidden h-[124px]">
            <div className="flex-1 text-left space-y-1">
                <h3 className="font-bold text-lg text-primary">{selectedBrand.format} Quiz</h3>
                <p className="text-sm text-muted-foreground">{selectedBrand.description}</p>
                <p className="text-xs text-muted-foreground">
                    Sponsored by <span className="font-semibold text-primary">{companyName}</span>
                </p>
                <p className="font-bold text-primary">win ₹100 for every 100 seconds!</p>
            </div>
            <div className="relative w-24 h-20 sm:w-28 sm:h-24 flex-shrink-0 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedBrand.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src={displayImageUrl}
                            alt={`${companyName} Logo`}
                            data-ai-hint={`${companyName} logo`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </CardContent>
    </Card>
  );
};

export default memo(SelectedBrandCardComponent);
