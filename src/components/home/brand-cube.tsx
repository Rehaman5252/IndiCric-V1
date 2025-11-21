'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { type CubeBrand } from '@/hooks/use-brand-ads';

interface BrandCubeProps {
    brands: CubeBrand[];
    rotation: { x: number; y: number };
    onFaceClick: (face: number, brand: CubeBrand) => void;
}

const faceTransforms = [
    { transform: 'rotateY(0deg) translateZ(80px)' }, // Front
    { transform: 'rotateY(90deg) translateZ(80px)' }, // Right
    { transform: 'rotateY(180deg) translateZ(80px)' }, // Back
    { transform: 'rotateY(-90deg) translateZ(80px)' }, // Left
    { transform: 'rotateX(90deg) translateZ(80px)' }, // Top
    { transform: 'rotateX(-90deg) translateZ(80px)' }, // Bottom
];

const BrandCube: React.FC<BrandCubeProps> = ({ brands, rotation, onFaceClick }) => {
    return (
        <div className="scene">
            <motion.div
                className="cube"
                animate={{ rotateX: rotation.x, rotateY: rotation.y }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
                {brands.map((brand, index) => (
                    <motion.div
                        key={brand.id}
                        className="cube-face"
                        style={{ ...faceTransforms[index] }}
                        onClick={() => onFaceClick(index, brand)}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Image
                            src={brand.logoUrl}
                            alt={`${brand.brand} Logo`}
                            width={100}
                            height={50}
                            className="object-contain"
                            data-ai-hint={brand.logoHint}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default BrandCube;