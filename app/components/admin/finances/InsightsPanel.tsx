'use client';

import React from 'react';
import { FinanceInsight } from '@/lib/finance-types';
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: FinanceInsight[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-purple-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-8 w-8 text-yellow-400" />
        <h2 className="text-2xl font-black text-white">💡 AI-Driven Insights</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {insight.type === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : insight.type === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                ) : (
                  <span className="text-gray-400">→</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{insight.message}</p>
                <p className="text-gray-400 text-xs mt-1">Metric: {insight.metric}</p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-lg ${
                    insight.type === 'up' ? 'text-green-400' : insight.type === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {insight.type === 'up' ? '+' : insight.type === 'down' ? '-' : ''}
                  {typeof insight.change === 'number' && insight.change > 1000
                    ? `₹${(insight.change / 1000).toFixed(0)}K`
                    : insight.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-950 border border-yellow-700 rounded-lg">
        <p className="text-yellow-200 text-xs">
          ⚠️ Next payout window opens in 2 hours 18 minutes for the 9:00 PM slot. Ensure all UPI verifications are complete.
        </p>
      </div>
    </div>
  );
}
