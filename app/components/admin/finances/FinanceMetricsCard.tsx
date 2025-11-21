'use client';

import React from 'react';
import { FinancialMetrics } from '@/lib/finance-types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  metrics: FinancialMetrics;
}

export default function FinanceMetricsCard({ metrics }: MetricsCardProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'from-green-600 to-green-700',
      trend: '+15.2%',
    },
    {
      title: 'Total Payouts',
      value: `₹${metrics.totalPayouts.toLocaleString()}`,
      icon: '💸',
      color: 'from-blue-600 to-blue-700',
      trend: '+8.3%',
    },
    {
      title: 'Pending Payouts',
      value: `₹${metrics.pendingPayouts.toLocaleString()}`,
      icon: '⏳',
      color: 'from-yellow-600 to-yellow-700',
      trend: '-2.1%',
      isCritical: true,
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      icon: '✅',
      color: 'from-emerald-600 to-emerald-700',
      trend: '+0.3%',
    },
    {
      title: 'Profit Margin',
      value: `${metrics.profitMargin}%`,
      icon: '📈',
      color: 'from-purple-600 to-purple-700',
      trend: '+2.1%',
    },
    {
      title: 'Avg Payout',
      value: `₹${metrics.averagePayoutAmount.toLocaleString()}`,
      icon: '🎯',
      color: 'from-pink-600 to-pink-700',
      trend: '+₹240',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-xl border border-opacity-20 border-white hover:shadow-2xl transition-all ${
            card.isCritical ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-sm font-semibold opacity-90">{card.title}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>

          <div className="space-y-2">
            <p className="text-4xl font-black text-white">{card.value}</p>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-200" />
              <span className="text-sm font-bold text-green-200">{card.trend}</span>
              <span className="text-gray-200 text-xs">this month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}