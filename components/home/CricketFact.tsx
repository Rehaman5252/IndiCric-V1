'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ✅ Hardcoded cricket facts
const CRICKET_FACTS = [
  "Did you know? The first cricket match was played in 1844 between USA and Canada!",
  "A googly is a type of delivery in cricket that looks like a leg-break but turns the opposite way.",
  "The word 'cricket' comes from the Old French word 'criquet', which means a stick or club.",
  "MS Dhoni is known for his helicopter shot - one of the most unique batting shots in cricket.",
  "The stumps in cricket are 28 inches (71.1 cm) tall - standardized since 1835.",
  "A cricket ball must weigh between 5.5 and 5.75 ounces (155.9 to 163 grams).",
  "The fastest cricket ball ever bowled was 170.3 km/h by Shoaib Akhtar in 2011.",
  "Virat Kohli is the fastest to reach 12,000 ODI runs in international cricket history.",
  "The boundary in cricket is 70-75 meters from the stumps - the largest cricket ground is the MCG.",
  "A cricket match between England and Australia, known as 'The Ashes', has been played since 1882.",
];

export default function CricketFact({ format }: { format: string }) {
  // ✅ ONLY ONE STATE: currentIndex
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ FIXED: Simple function - no dependencies causing resets
  const handleNextFact = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % CRICKET_FACTS.length);
  }, []);

  const currentFact = CRICKET_FACTS[currentIndex];

  return (
    <Card className="bg-card/80 shadow-lg border border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Dressing Room Banter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fact Display */}
        <div className="min-h-[80px] flex items-center justify-center text-center px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={`fact-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {currentFact}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Fact counter */}
        <div className="text-xs text-center text-muted-foreground font-semibold">
          {currentIndex + 1} / {CRICKET_FACTS.length}
        </div>

        {/* Next Delivery Button */}
        <div className="flex justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleNextFact}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Next Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
