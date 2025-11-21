'use client';

import React from 'react';

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  color: string;
}

const metrics: PerformanceMetric[] = [
  { label: 'Database Health', value: 95, unit: '%', threshold: 80, color: 'from-green-600 to-green-700' },
  { label: 'Storage Used', value: 65, unit: '%', threshold: 80, color: 'from-blue-600 to-blue-700' },
  { label: 'API Response Time', value: 45, unit: 'ms', threshold: 100, color: 'from-yellow-600 to-yellow-700' },
  { label: 'Error Rate', value: 0.2, unit: '%', threshold: 1, color: 'from-purple-600 to-purple-700' },
];

export default function SystemPerformance() {
  const CircleProgress = ({ value, label, unit, threshold }: PerformanceMetric) => {
    const isHealthy = value <= threshold;
    const percentage = Math.min((value / threshold) * 100, 100);

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isHealthy ? '#22c55e' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={`${(percentage / 100) * 283} 283`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-white font-black text-lg">
              {value}
              <span className="text-xs">{unit}</span>
            </p>
          </div>
        </div>
        <p className="text-gray-300 text-xs font-semibold mt-3 text-center">{label}</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-8">🖥️ System Performance</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <CircleProgress key={idx} {...metric} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <p className="text-yellow-500 font-bold text-sm mb-2">📊 System Status</p>
        <p className="text-gray-300 text-xs">
          All systems operational. Last backup: Nov 7 2:15 AM | Database sync: Real-time | Error logs: 2 (resolved)
        </p>
      </div>
    </div>
  );
}
