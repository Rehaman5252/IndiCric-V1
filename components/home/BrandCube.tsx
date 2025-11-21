'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { brandData, type CubeBrand } from '@/components/home/brandData';
import { getAdsBySlot } from '@/lib/ad-service';

interface BrandCubeProps {
  onFaceClick: (brand: CubeBrand) => void;
  rotation: { x: number; y: number };
}

const BrandCube = ({ onFaceClick, rotation }: BrandCubeProps) => {
  const [logoUrls, setLogoUrls] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadAds = async () => {
      const urls: { [key: number]: string } = {};

      for (const brand of brandData) {
        try {
          const ads = await getAdsBySlot(brand.format as any);
          if (ads.length > 0) {
            urls[brand.id] = ads[0].mediaUrl;
            console.log(`✅ ${brand.format}: Using ad image`);
          } else {
            urls[brand.id] = brand.logoUrl;
            console.log(`⚠️ ${brand.format}: Using default logo`);
          }
        } catch (error) {
          urls[brand.id] = brand.logoUrl;
          console.error(`❌ Error for ${brand.format}:`, error);
        }
      }

      setLogoUrls(urls);
    };

    loadAds();
  }, []);

  const faces = [
    { class: 'cube-face-front', brand: brandData[0] },
    { class: 'cube-face-right', brand: brandData[1] },
    { class: 'cube-face-back', brand: brandData[2] },
    { class: 'cube-face-left', brand: brandData[3] },
    { class: 'cube-face-top', brand: brandData[4] },
    { class: 'cube-face-bottom', brand: brandData[5] },
  ];

  const handleFaceClick = (e: React.MouseEvent, brand: CubeBrand) => {
    e.stopPropagation();
    onFaceClick(brand);
  };

  return (
    <div className="scene">
      <div
        className="cube"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {faces.map((face) => (
          <button
            key={face.brand.id}
            className={`cube-face ${face.class}`}
            onClick={(e) => handleFaceClick(e, face.brand)}
            aria-label={`Play ${face.brand.format} Quiz`}
          >
            <div className="flex flex-col items-center justify-center p-2 text-inherit w-full h-full text-center">
              <div className="w-full h-16 mb-1 relative">
                <Image
                  src={logoUrls[face.brand.id] || face.brand.logoUrl}
                  alt={`${face.brand.brand} logo`}
                  data-ai-hint={`${face.brand.brand} logo`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
              <p className="font-normal text-lg tracking-tight text-primary">{face.brand.format}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandCube;
