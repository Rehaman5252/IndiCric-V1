'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: Date;
  admin: string;
  action: string;
  module: string;
  status: 'success' | 'failed';
  ipAddress: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <Card className="shadow-lg border-0 overflow-x-auto">
      <CardHeader>
        <CardTitle>Activity Log Details</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 bg-gray-100">
              <th className="text-left p-3 font-bold">Timestamp</th>
              <th className="text-left p-3 font-bold">Admin</th>
              <th className="text-left p-3 font-bold">Action</th>
              <th className="text-left p-3 font-bold">Module</th>
              <th className="text-left p-3 font-bold">Status</th>
              <th className="text-left p-3 font-bold">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-gray-700">
                  {format(log.timestamp, 'MMM dd, HH:mm:ss')}
                </td>
                <td className="p-3">{log.admin}</td>
                <td className="p-3 font-semibold">{log.action}</td>
                <td className="p-3">{log.module}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 font-mono text-gray-600">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
