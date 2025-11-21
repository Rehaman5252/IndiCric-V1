'use client';

import React from 'react';
import { KPIMetric } from '@/lib/dashboard-types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ metric }: { metric: KPIMetric }) {
  const getTrendIcon = () => {
    if (metric.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (metric.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (metric.trend === 'up') return 'text-green-400';
    if (metric.trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div
      className={`bg-gradient-to-br ${metric.color} rounded-2xl p-6 shadow-xl border border-opacity-20 border-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white text-sm font-semibold opacity-90">{metric.label}</p>
          <p className="text-gray-200 text-xs mt-1">{metric.description}</p>
        </div>
        <span className="text-4xl">{metric.icon}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black text-white">{metric.value}</p>
          <p className="text-white text-sm opacity-70">{metric.unit}</p>
        </div>

        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-bold ${getTrendColor()}`}>
            {metric.growth > 0 ? '+' : ''}{metric.growth}%
          </span>
          <span className="text-gray-300 text-xs">from last month</span>
        </div>
      </div>

      {/* Sparkline background effect */}
      <div className="mt-4 h-1 bg-white opacity-20 rounded-full"></div>
    </div>
  );
}
