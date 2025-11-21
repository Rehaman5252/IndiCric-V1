'use client';

import React, { useEffect, useState } from 'react';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveSessions, endSession } from '@/lib/firestore-service';
import { format } from 'date-fns';
import { LogOut, Globe, Monitor } from 'lucide-react';

export default function LoginSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getActiveSessions();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogoutSession = async (sessionId: string) => {
    if (!confirm('Force logout this session?')) return;
    try {
      await endSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      alert('Session terminated successfully');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading sessions...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminAuthGuard requiredPermissions={['*']}>
      <AdminLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Active Admin Sessions</h2>

          {/* Summary */}
          <Card className="bg-blue-50 shadow-lg border-0">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{sessions.length}</p>
              </div>
              <Monitor className="h-12 w-12 text-blue-600" />
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card className="shadow-lg border-0 overflow-x-auto">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3 font-bold">Admin Email</th>
                    <th className="text-left p-3 font-bold">Login Time</th>
                    <th className="text-left p-3 font-bold">Last Activity</th>
                    <th className="text-left p-3 font-bold">IP Address</th>
                    <th className="text-left p-3 font-bold">Device</th>
                    <th className="text-left p-3 font-bold">Location</th>
                    <th className="text-left p-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{session.adminEmail}</td>
                      <td className="p-3 text-xs">
                        {format(new Date(session.loginTime.toDate()), 'MMM dd, HH:mm')}
                      </td>
                      <td className="p-3 text-xs">
                        {format(new Date(session.lastActivityTime.toDate()), 'MMM dd, HH:mm')}
                      </td>
                      <td className="p-3 text-gray-600">{session.ipAddress}</td>
                      <td className="p-3 text-xs">{session.deviceInfo}</td>
                      <td className="p-3 text-xs flex items-center gap-1">
                        <Globe className="h-4 w-4" /> {session.location}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                        >
                          <LogOut className="h-4 w-4" /> Force Logout
                        </button>
                      </td>
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
