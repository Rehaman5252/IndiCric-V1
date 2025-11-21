'use client';

import React from 'react';
import { DailyRevenue } from '@/lib/finance-types';

interface FinanceHeatmapProps {
  data: DailyRevenue[];
}

export default function FinanceHeatmap({ data }: FinanceHeatmapProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  const getIntensity = (revenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 80) return 'bg-gradient-to-br from-yellow-600 to-yellow-700';
    if (percentage >= 60) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
    if (percentage >= 40) return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
    if (percentage >= 20) return 'bg-gradient-to-br from-yellow-300 to-yellow-400';
    return 'bg-gradient-to-br from-gray-700 to-gray-800';
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">📅 Revenue Heatmap Calendar</h2>

      <div className="grid grid-cols-7 gap-3 mb-6">
        {data.map((day, idx) => (
          <div key={idx} className="text-center group">
            <div
              className={`${getIntensity(day.revenue)} rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition-all transform hover:scale-110`}
            >
              <p className="text-white font-bold text-sm">{day.date}</p>
              <p className="text-white font-black text-2xl mt-1">₹{(day.revenue / 1000).toFixed(0)}K</p>
            </div>
            {/* Tooltip on hover */}
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-3 py-2 mt-2 z-10 whitespace-nowrap">
              <p>Revenue: ₹{day.revenue.toLocaleString()}</p>
              <p>Payouts: ₹{day.payouts.toLocaleString()}</p>
              <p>Profit: ₹{day.profit.toLocaleString()}</p>
              <p>Slots: {day.slots} | Winners: {day.winners}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Less ← → More</span>
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded"></div>
          <div className="w-4 h-4 bg-yellow-300 rounded"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <div className="w-4 h-4 bg-yellow-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}
