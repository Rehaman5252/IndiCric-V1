'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Globe } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: string;
  adminEmail: string;
  loginTime: Date;
  lastActivityTime: Date;
  ipAddress: string;
  deviceInfo: string;
  location: string;
}

interface SessionListProps {
  sessions: Session[];
  onForceLogout?: (sessionId: string) => void;
}

export default function SessionList({ sessions, onForceLogout }: SessionListProps) {
  return (
    <Card className="shadow-lg border-0 overflow-x-auto">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 bg-gray-100">
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
                  {format(session.loginTime, 'MMM dd, HH:mm')}
                </td>
                <td className="p-3 text-xs">
                  {format(session.lastActivityTime, 'MMM dd, HH:mm')}
                </td>
                <td className="p-3 text-gray-600 font-mono text-xs">{session.ipAddress}</td>
                <td className="p-3 text-xs">{session.deviceInfo}</td>
                <td className="p-3 text-xs flex items-center gap-1">
                  <Globe className="h-4 w-4" /> {session.location}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onForceLogout?.(session.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" /> Force Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
