'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CubeBrand } from '@/hooks/use-brand-ads';

interface SelectedBrandCardProps {
    brand: CubeBrand;
    onPlayNow: () => void;
}

export default function SelectedBrandCard({ brand, onPlayNow }: SelectedBrandCardProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="flex flex-col justify-between h-full">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Image
                                src={brand.logoUrl}
                                alt={`${brand.brand} logo`}
                                width={64}
                                height={64}
                                className="object-contain"
                                data-ai-hint={brand.logoHint}
                            />
                            <div>
                                <CardTitle>{brand.format} Quiz</CardTitle>
                                <CardDescription>Sponsored by {brand.brand}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{brand.description}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={onPlayNow}>
                            Play Now
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}