'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveSessions, endSession } from '@/lib/firestore-service';
import { Monitor } from 'lucide-react';
import SessionList from './SessionList';

export default function SessionMonitor() {
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
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleForceLogout = async (sessionId: string) => {
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
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
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
      <SessionList
        sessions={sessions.map(s => ({
          id: s.id,
          adminEmail: s.adminEmail,
          loginTime: new Date(s.loginTime.toDate()),
          lastActivityTime: new Date(s.lastActivityTime.toDate()),
          ipAddress: s.ipAddress,
          deviceInfo: s.deviceInfo,
          location: s.location,
        }))}
        onForceLogout={handleForceLogout}
      />
    </div>
  );
}
