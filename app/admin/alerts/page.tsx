'use client';

import React, { useEffect, useState } from 'react';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUnreadAlerts, markAlertAsRead } from '@/lib/firestore-service';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Bell, Trash2 } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getUnreadAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(alerts.map(a => (a.id === alertId ? { ...a, read: true } : a)));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚙️';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading alerts...</div>
      </AdminLayout>
    );
  }

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Alerts Center</h2>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-red-50 shadow-lg border-0">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-700 mt-2">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 shadow-lg border-0">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">High</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">
                  {alerts.filter(a => a.severity === 'high').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 shadow-lg border-0">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Medium</p>
                <p className="text-3xl font-bold text-yellow-700 mt-2">
                  {alerts.filter(a => a.severity === 'medium').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 shadow-lg border-0">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Low</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {alerts.filter(a => a.severity === 'low').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  filterSeverity === severity
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6 text-center text-gray-600">
                  ✅ No alerts! All systems running smoothly.
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={`shadow-lg border-2 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                          <h3 className="font-bold text-lg">{alert.type.replace(/_/g, ' ')}</h3>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <p className="text-xs opacity-70">
                          {format(new Date(alert.createdAt.toDate()), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 text-sm font-semibold"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Read
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
