'use client';

import React, { useState } from 'react';
import { ActivityFeed } from '@/lib/dashboard-types';

export default function ActivityFeedComponent({ activities }: { activities: ActivityFeed[] }) {
  const [filter, setFilter] = useState<'all' | 'user' | 'admin' | 'system' | 'ad' | 'quiz'>('all');

  const filteredActivities =
    filter === 'all' ? activities : activities.filter((a) => a.type === filter);

  const getColorClass = (type: ActivityFeed['type']) => {
    const colors = {
      user: 'bg-blue-900 border-blue-700',
      admin: 'bg-purple-900 border-purple-700',
      system: 'bg-gray-800 border-gray-700',
      ad: 'bg-cyan-900 border-cyan-700',
      quiz: 'bg-orange-900 border-orange-700',
    };
    return colors[type];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">📜 Live Activity Feed</h2>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'user', 'admin', 'system', 'ad', 'quiz'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition ${
                filter === f
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`${getColorClass(activity.type)} border rounded-lg p-4 hover:shadow-lg transition-all hover:scale-102`}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{activity.message}</p>
                <p className="text-gray-400 text-xs mt-1">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center mt-4">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>
    </div>
  );
}
