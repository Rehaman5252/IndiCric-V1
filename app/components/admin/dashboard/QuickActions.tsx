'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const quickActions = [
  { label: 'Create Quiz', emoji: '➕', path: '/admin/quizzes', color: 'from-purple-600 to-purple-700' },
  { label: 'Process Payout', emoji: '💸', path: '/admin/finances', color: 'from-green-600 to-green-700' },
  { label: 'Upload Ad', emoji: '📤', path: '/admin/ads', color: 'from-cyan-600 to-cyan-700' },
  { label: 'Moderate Posts', emoji: '💬', path: '/admin/content', color: 'from-pink-600 to-pink-700' },
  { label: 'View Users', emoji: '👥', path: '/admin/users', color: 'from-blue-600 to-blue-700' },
  { label: 'Support Tickets', emoji: '🆘', path: '/admin/support', color: 'from-red-600 to-red-700' },
  { label: 'Analytics', emoji: '📊', path: '/admin/analytics', color: 'from-indigo-600 to-indigo-700' },
  { label: 'Settings', emoji: '⚙️', path: '/admin/settings', color: 'from-gray-600 to-gray-700' },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">⚡ Quick Actions</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => router.push(action.path)}
            className={`bg-gradient-to-br ${action.color} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-110 flex flex-col items-center gap-3 group`}
          >
            <span className="text-4xl group-hover:scale-125 transition-transform">{action.emoji}</span>
            <span className="text-white font-bold text-center text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
