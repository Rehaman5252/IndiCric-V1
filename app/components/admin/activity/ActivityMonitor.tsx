'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityLogs } from '@/lib/firestore-service';
import { format } from 'date-fns';
import { Search, Filter, Download } from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import ActivityLog from './ActivityLog';

export default function ActivityMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewType, setViewType] = useState<'feed' | 'table'>('feed');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLogs();
        setLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.status === filterType);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterType, logs]);

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Module', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp.toDate()), 'yyyy-MM-dd HH:mm:ss'),
        log.adminEmail,
        log.action,
        log.module,
        log.status,
        log.ipAddress,
      ]),
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-center py-8">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Activity Monitor Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by admin or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as 'feed' | 'table')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600"
            >
              <option value="feed">Feed View</option>
              <option value="table">Table View</option>
            </select>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Download className="h-5 w-5" />
              Export CSV
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Display */}
      {viewType === 'feed' ? (
        <ActivityFeed
          activities={filteredLogs.map(log => ({
            id: log.id,
            timestamp: new Date(log.timestamp.toDate()),
            admin: log.adminEmail,
            action: log.action,
            details: log.details || log.module,
            icon: log.status === 'success' ? '✅' : '❌',
            color: log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
          }))}
        />
      ) : (
        <ActivityLog
          logs={filteredLogs.map(log => ({
            id: log.id,
            timestamp: new Date(log.timestamp.toDate()),
            admin: log.adminEmail,
            action: log.action,
            module: log.module,
            status: log.status,
            ipAddress: log.ipAddress,
          }))}
        />
      )}
    </div>
  );
}
