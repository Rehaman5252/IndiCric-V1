'use client';

import React, { useState } from 'react';
import { Winner } from '@/lib/finance-types';
import { Check, X, RotateCcw, Eye } from 'lucide-react';

interface WinnersTableProps {
  winners: Winner[];
}

export default function WinnersTable({ winners }: WinnersTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');

  const filteredWinners =
    filter === 'all' ? winners : winners.filter((w) => w.status === filter);

  const getStatusColor = (status: Winner['status']) => {
    const colors = {
      pending: 'bg-yellow-900 text-yellow-200',
      success: 'bg-green-900 text-green-200',
      failed: 'bg-red-900 text-red-200',
      processing: 'bg-blue-900 text-blue-200',
      reversed: 'bg-purple-900 text-purple-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Winner['status']) => {
    const icons = {
      pending: '⏳',
      success: '✅',
      failed: '❌',
      processing: '⚙️',
      reversed: '↩️',
    };
    return icons[status];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">🏆 Winners & Payouts</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'success', 'failed'] as const).map((f) => (
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800 bg-gray-800">
              <th className="text-left px-4 py-3 font-bold text-yellow-500">WINNER NAME</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">UPI</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">AMOUNT</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">SLOT</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">STATUS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">PROCESSED BY</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredWinners.map((winner) => (
              <tr key={winner.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="px-4 py-3 text-white font-semibold">{winner.username}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{winner.upi}</td>
                <td className="px-4 py-3 text-white font-bold">₹{winner.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{winner.slotId}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(winner.status)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(winner.status)}`}>
                      {winner.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{winner.processedBy || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  {winner.status === 'failed' && (
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition" title="Retry">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black transition" title="View Details">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Showing {filteredWinners.length} of {winners.length} winners
      </div>
    </div>
  );
}
