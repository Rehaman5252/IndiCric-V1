'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Zap } from 'lucide-react';

export default function RealTimeHealthCards() {
  const [countdownTime, setCountdownTime] = useState('00:02:18');
  const [activeSlotRevenue, setActiveSlotRevenue] = useState(171000);
  const [queueCount, setQueueCount] = useState(12);
  const [successRate, setSuccessRate] = useState(98.7);

  useEffect(() => {
    // Simulate countdown timer
    const timer = setInterval(() => {
      setCountdownTime((prev) => {
        const [minutes, seconds] = prev.split(':').map(Number);
        let newSeconds = seconds - 1;
        let newMinutes = minutes;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes--;
        }

        if (newMinutes < 0) return '00:00:00';
        return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const healthCards = [
    {
      title: 'Active Slot Revenue',
      value: `₹${activeSlotRevenue.toLocaleString()}`,
      subtitle: '9:00 PM - 9:10 PM Slot',
      icon: '🔴',
      color: 'border-red-500',
      bgColor: 'bg-red-950',
      badge: 'LIVE',
    },
    {
      title: 'Next Payout Countdown',
      value: countdownTime,
      subtitle: 'For 9:00 PM Slot',
      icon: '⏱️',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-950',
      badge: 'STARTING SOON',
    },
    {
      title: 'Auto-Payout Queue',
      value: queueCount,
      subtitle: 'Pending Winners',
      icon: '📋',
      color: 'border-blue-500',
      bgColor: 'bg-blue-950',
      badge: 'QUEUED',
    },
    {
      title: 'Today\'s Success Rate',
      value: `${successRate}%`,
      subtitle: '342 Successful Payouts',
      icon: '✅',
      color: 'border-green-500',
      bgColor: 'bg-green-950',
      badge: 'EXCELLENT',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {healthCards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgColor} border-2 ${card.color} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest">{card.title}</p>
              <div className="mt-2">
                <div className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-black rounded">
                  {card.badge}
                </div>
              </div>
            </div>
            <span className="text-3xl animate-pulse">{card.icon}</span>
          </div>

          <p className="text-4xl font-black text-white mt-4">{card.value}</p>
          <p className="text-gray-400 text-sm mt-2">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
