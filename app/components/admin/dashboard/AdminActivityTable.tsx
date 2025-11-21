'use client';

import React from 'react';
import { AdminActivity } from '@/lib/dashboard-types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminActivityTable({ activities }: { activities: AdminActivity[] }) {
  const getStatusIcon = (status: AdminActivity['status']) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const getStatusColor = (status: AdminActivity['status']) => {
    const colors = {
      success: 'bg-green-900 text-green-200',
      pending: 'bg-yellow-900 text-yellow-200',
      reverted: 'bg-red-900 text-red-200',
    };
    return colors[status];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">🔐 Admin Activity Log</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800 bg-gray-800">
              <th className="text-left px-4 py-3 font-bold text-yellow-500">ADMIN</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">ACTION</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">TIME</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">STATUS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">IP ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="px-4 py-3 text-white font-semibold">{activity.admin}</td>
                <td className="px-4 py-3 text-gray-300">{activity.action}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{activity.timestamp}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(activity.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{activity.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
