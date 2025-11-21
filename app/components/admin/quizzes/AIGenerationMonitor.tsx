'use client';

import React from 'react';
import { AIGenerationStatus } from '@/lib/quiz-types';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';

interface AIGenerationMonitorProps {
  status: AIGenerationStatus;
}

export default function AIGenerationMonitor({ status }: AIGenerationMonitorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Summary Cards */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 shadow-xl border border-opacity-20 border-white">
        <h3 className="text-xl font-black text-white mb-6">✅ AI Generation Success</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Success Rate (24h)</span>
              <span className="text-3xl font-black text-white">{status.successRate}%</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full"
                style={{ width: `${status.successRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 mt-4">
            <p className="text-white text-sm">
              <span className="font-bold">API Provider:</span> {status.apiProvider.toUpperCase()}
            </p>
            <p className="text-white text-sm mt-2">
              <span className="font-bold">Avg Generation Time:</span> {status.averageGenerationTime}ms
            </p>
          </div>
        </div>
      </div>

      {/* Alerts & Issues */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 shadow-xl border border-opacity-20 border-white">
        <h3 className="text-xl font-black text-white mb-6">⚠️ Issues & Fallbacks</h3>

        <div className="space-y-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5" /> Fallbacks Used
              </span>
              <span className="text-3xl font-black text-yellow-300">{status.fallbackUsed}</span>
            </div>
            <p className="text-white text-xs opacity-75">Times pool was used instead of AI</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Failed Attempts
              </span>
              <span className="text-3xl font-black text-red-300">{status.failedAttempts}</span>
            </div>
            <p className="text-white text-xs opacity-75">API calls that returned errors</p>
          </div>

          {/* Error Log */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mt-4">
            <p className="text-white font-bold text-sm mb-2">Recent Errors:</p>
            <div className="space-y-2">
              {status.errorLog.slice(0, 3).map((err, idx) => (
                <div key={idx} className="text-xs text-white opacity-80 border-l-2 border-red-400 pl-2">
                  <p className="font-mono">{err.error}</p>
                  <p className="text-xs opacity-60">Retry #{err.retryCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
