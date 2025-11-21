'use client';

import React, { useState } from 'react';
import { DailyRevenue, SlotPerformance } from '@/lib/finance-types';

interface AnalyticsChartsProps {
  dailyRevenue: DailyRevenue[];
  slotPerformance: SlotPerformance[];
}

export default function AnalyticsCharts({ dailyRevenue, slotPerformance }: AnalyticsChartsProps) {
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue));
  const maxProfit = Math.max(...dailyRevenue.map((d) => d.profit));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue vs Payout Chart */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-black text-white mb-6">💰 Revenue vs Payout Ratio</h3>

        <div className="space-y-3">
          {dailyRevenue.map((day, idx) => {
            const revenueHeight = (day.revenue / maxRevenue) * 100;
            const payoutHeight = (day.payouts / maxRevenue) * 100;
            const margin = ((day.revenue - day.payouts) / day.revenue * 100).toFixed(1);

            return (
              <div key={idx} className="flex items-end gap-4 h-16">
                <div className="w-20 text-xs font-bold text-gray-400">{day.date}</div>
                <div className="flex-1 flex gap-2 items-end">
                  {/* Revenue bar */}
                  <div className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t hover:from-yellow-400 hover:to-yellow-300 transition-all"
                      style={{ height: `${revenueHeight}%` }}
                    >
                      <div className="text-white text-xs font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        ₹{(day.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Rev</p>
                  </div>

                  {/* Payout bar */}
                  <div className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-400 hover:to-green-300 transition-all"
                      style={{ height: `${payoutHeight}%` }}
                    >
                      <div className="text-white text-xs font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        ₹{(day.payouts / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Payout</p>
                  </div>

                  {/* Margin label */}
                  <div className="w-16 text-right">
                    <p className="text-xs font-bold text-purple-400">{margin}%</p>
                    <p className="text-xs text-gray-500">Margin</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Slots */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-black text-white mb-6">🏆 Top Performing Slots</h3>

        <div className="space-y-4">
          {slotPerformance
            .sort((a, b) => b.revenue - a.revenue)
            .map((slot, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">{idx + 1}. {slot.slotTime}</p>
                    <p className="text-gray-400 text-xs">{slot.slotId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-black text-lg">₹{(slot.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-gray-400 text-xs">{slot.winners} Winners</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full"
                      style={{
                        width: `${(slot.participationRate / 100) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">{slot.participationRate}%</span>
                </div>

                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Payouts: ₹{(slot.payouts / 1000).toFixed(0)}K</span>
                  <span>Margin: {slot.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
