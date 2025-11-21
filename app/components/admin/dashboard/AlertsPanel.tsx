'use client';

import React from 'react';
import { AlertItem } from '@/lib/dashboard-types';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  const getAlertIcon = (severity: AlertItem['severity']) => {
    if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (severity === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    return <Info className="h-5 w-5 text-blue-400" />;
  };

  const getAlertBG = (severity: AlertItem['severity']) => {
    const bg = {
      critical: 'bg-red-950 border-red-700',
      warning: 'bg-yellow-950 border-yellow-700',
      info: 'bg-blue-950 border-blue-700',
    };
    return bg[severity];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-black text-white mb-6">🔔 Active Alerts</h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className={`${getAlertBG(alert.severity)} border rounded-lg p-4`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.severity)}
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{alert.title}</p>
                  <p className="text-gray-300 text-xs mt-1">{alert.description}</p>
                  <p className="text-gray-500 text-xs mt-2">{alert.timestamp}</p>
                </div>
              </div>
              {alert.action && (
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded text-xs flex-shrink-0 transition">
                  {alert.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center text-gray-400 py-8">✅ All systems operational</div>
      )}
    </div>
  );
}
