'use client';

import React, { useState } from 'react';
import { ChartData } from '@/lib/dashboard-types';

export default function ActivityChart({ data }: { data: ChartData[] }) {
  const [filter, setFilter] = useState<'users' | 'active' | 'engaged' | 'revenue'>('active');

  const maxValue = Math.max(...data.map((d) => d[filter]));

  const getChartLabel = () => {
    const labels = {
      users: 'Total Users',
      active: 'Active Users',
      engaged: 'Engaged Users',
      revenue: 'Revenue (₹)',
    };
    return labels[filter];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white">📈 {getChartLabel()} Trend</h2>
        <div className="flex gap-2">
          {(['users', 'active', 'engaged', 'revenue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filter === f
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-4 h-64 mb-6">
        {data.map((item, idx) => {
          const height = (item[filter] / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div
                className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 cursor-pointer relative group"
                style={{ height: `${height}%`, minHeight: '20px' }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-yellow-400 px-3 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item[filter].toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-400 font-mono">{item.date}</span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-400 text-center">Last 7 days activity</div>
    </div>
  );
}
