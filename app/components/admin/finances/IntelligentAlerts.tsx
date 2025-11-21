'use client';

import React from 'react';
import { Alert } from '@/lib/finance-types';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface IntelligentAlertsProps {
  alerts: Alert[];
}

export default function IntelligentAlerts({ alerts }: IntelligentAlertsProps) {
  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      payout_failed: '❌',
      upi_mismatch: '⚠️',
      revenue_variance: '📊',
      delayed_payout: '⏳',
      fraud_detected: '🚨',
    };
    return icons[type];
  };

  const getAlertColor = (severity: Alert['severity']) => {
    const colors = {
      critical: 'border-red-600 bg-red-950',
      warning: 'border-yellow-600 bg-yellow-950',
      info: 'border-blue-600 bg-blue-950',
    };
    return colors[severity];
  };

  return (
    <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">🔔 Smart Alerts & Notifications</h2>
        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
          {alerts.filter((a) => !a.resolved).length} Active
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-2 ${getAlertColor(alert.severity)} rounded-xl p-4 hover:shadow-lg transition-all`}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-white font-bold text-sm">{alert.message}</p>
                  {alert.resolved && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                      RESOLVED
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">
                  {alert.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
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
        <div className="text-center text-gray-400 py-8">✅ All systems operational - No alerts</div>
      )}
    </div>
  );
}
