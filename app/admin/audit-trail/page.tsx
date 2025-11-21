'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityLogs } from '@/lib/firestore-service';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLogs(undefined, 200);
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading audit trail...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Complete Audit Trail</h2>
          <p className="text-gray-600">Full record of all system actions for compliance & security</p>

          <Card className="shadow-lg border-0 overflow-x-auto">
            <CardHeader>
              <CardTitle>Audit Log ({logs.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 bg-gray-100">
                    <th className="text-left p-3 font-bold">Timestamp</th>
                    <th className="text-left p-3 font-bold">Admin</th>
                    <th className="text-left p-3 font-bold">Action</th>
                    <th className="text-left p-3 font-bold">Module</th>
                    <th className="text-left p-3 font-bold">Resource</th>
                    <th className="text-left p-3 font-bold">Status</th>
                    <th className="text-left p-3 font-bold">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-700">
                        {format(new Date(log.timestamp.toDate()), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="p-3">{log.adminEmail}</td>
                      <td className="p-3 font-semibold">{log.action.replace(/_/g, ' ')}</td>
                      <td className="p-3">{log.module}</td>
                      <td className="p-3 font-mono text-gray-600">{log.resourceId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
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
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
