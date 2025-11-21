'use client';

import React, { useState } from 'react';
import { QuizSlot } from '@/lib/quiz-types';
import { Play, Edit2, RotateCcw, Trash2, Eye, Zap } from 'lucide-react';

interface QuizScheduleManagerProps {
  slots: QuizSlot[];
}

export default function QuizScheduleManager({ slots }: QuizScheduleManagerProps) {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'completed' | 'cancelled'>('all');

  const filteredSlots =
    filter === 'all' ? slots : slots.filter((s) => s.status === filter);

  const getStatusColor = (status: QuizSlot['status']) => {
    const colors = {
      scheduled: 'bg-blue-900 text-blue-200',
      live: 'bg-green-900 text-green-200 animate-pulse',
      completed: 'bg-gray-900 text-gray-200',
      cancelled: 'bg-red-900 text-red-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: QuizSlot['status']) => {
    const icons = {
      scheduled: '📅',
      live: '🔴',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status];
  };

  const getGenStatusIcon = (genStatus: QuizSlot['questionGeneration']['status']) => {
    const icons = {
      success: '✅',
      fallback: '⚠️',
      failed: '❌',
      pending: '⏳',
    };
    return icons[genStatus];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">📅 Quiz Schedule Manager</h2>
        <div className="flex gap-2">
          {(['all', 'scheduled', 'live', 'completed', 'cancelled'] as const).map((f) => (
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
              <th className="text-left px-4 py-3 font-bold text-yellow-500">SLOT</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">DATE</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">TIME</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">STATUS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">PARTICIPANTS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">QUESTIONS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">AI STATUS</th>
              <th className="text-left px-4 py-3 font-bold text-yellow-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlots.map((slot) => (
              <tr key={slot.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="px-4 py-3 text-white font-bold">#{slot.slotNumber}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {slot.scheduledDate.toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 text-gray-300">{slot.startTime} - {slot.endTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(slot.status)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(slot.status)}`}>
                      {slot.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-bold">{slot.participants}</td>
                <td className="px-4 py-3 text-gray-300">{slot.questionGeneration.method.toUpperCase()}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <span>{getGenStatusIcon(slot.questionGeneration.status)}</span>
                  <span className="text-xs text-gray-400">{slot.questionGeneration.status}</span>
                  {slot.questionGeneration.confidenceScore && (
                    <span className="text-xs font-bold text-green-400">{slot.questionGeneration.confidenceScore}%</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {slot.status === 'scheduled' && (
                    <button className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition" title="Start">
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {slot.status === 'live' && (
                    <button className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition" title="Stop">
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                  {slot.status === 'cancelled' && (
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition" title="Restore">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black transition" title="View">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition" title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {slot.status !== 'cancelled' && (
                    <button className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition" title="Cancel">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Showing {filteredSlots.length} of {slots.length} slots
      </div>
    </div>
  );
}
