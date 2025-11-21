'use client';

import { useState } from 'react';
import { AD_SLOT_NAMES, AdSlot, VIDEO_AD_SLOTS, CUBE_AD_SLOTS } from '@/types/ads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdSlotSelectorProps {
  selectedSlot: AdSlot | null;
  onSelectSlot: (slot: AdSlot) => void;
}

export default function AdSlotSelector({ selectedSlot, onSelectSlot }: AdSlotSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">📍 Select Ad Slot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CUBE ADS */}
          <div>
            <h3 className="text-sm font-bold text-yellow-400 mb-3">🎲 CUBE FACES (6 Slots)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CUBE_AD_SLOTS.map(slot => (
                <Button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  variant={selectedSlot === slot ? 'default' : 'outline'}
                  className={`${
                    selectedSlot === slot
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'border-yellow-600 text-yellow-600'
                  }`}
                >
                  {AD_SLOT_NAMES[slot]}
                </Button>
              ))}
            </div>
          </div>

          {/* QUIZ ADS */}
          <div>
            <h3 className="text-sm font-bold text-blue-400 mb-3">❓ QUIZ FLOW (5 Slots)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Q1_Q2', 'Q2_Q3', 'Q3_Q4', 'Q4_Q5', 'AfterQuiz'].map(slot => {
                const isVideo = VIDEO_AD_SLOTS.includes(slot as AdSlot);
                return (
                  <Button
                    key={slot}
                    onClick={() => onSelectSlot(slot as AdSlot)}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    className={`${
                      selectedSlot === slot
                        ? isVideo
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        : isVideo
                        ? 'border-red-600 text-red-600'
                        : 'border-blue-600 text-blue-600'
                    }`}
                  >
                    {AD_SLOT_NAMES[slot as AdSlot]}
                    {isVideo && ' 🎬'}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* SELECTED INFO */}
          {selectedSlot && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-sm font-semibold text-green-400">
                ✅ Selected: <span className="text-white">{AD_SLOT_NAMES[selectedSlot]}</span>
              </p>
              {VIDEO_AD_SLOTS.includes(selectedSlot) && (
                <p className="text-xs text-yellow-400 mt-1">
                  🎬 This is a <strong>VIDEO AD SLOT</strong> - Full-screen interstitial recommended
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
