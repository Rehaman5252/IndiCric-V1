'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from './KPICard';
import QuickActions from './QuickActions';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeQuizzes: number;
  perfectWinners: number;
  pendingPayouts: number;
  activeAds: number;
  pendingComments: number;
  cubeLogos: number;
  activeAdmins: number;
  failedLogins: number;
  lastBackup: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [stats] = useState<DashboardStats>({
    totalUsers: 1240,
    activeQuizzes: 3,
    perfectWinners: 45,
    pendingPayouts: 25000,
    activeAds: 12,
    pendingComments: 8,
    cubeLogos: 6,
    activeAdmins: 2,
    failedLogins: 3,
    lastBackup: '2 hours ago',
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 shadow-lg">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold">Welcome to IndCric Super Admin Panel 🎉</h1>
          <p className="text-green-100 mt-2">Real-time monitoring, full system control, and complete audit trail.</p>
        </CardContent>
      </Card>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-50"
          trend={{ value: 12, direction: 'up' }}
          onClick={() => router.push('/admin/users')}
        />
        <KPICard
          title="Active Quizzes"
          value={stats.activeQuizzes}
          icon="❓"
          color="bg-green-50"
          trend={{ value: 5, direction: 'up' }}
          onClick={() => router.push('/admin/quiz')}
        />
        <KPICard
          title="Perfect Winners"
          value={stats.perfectWinners}
          icon="🏆"
          color="bg-yellow-50"
          trend={{ value: 8, direction: 'up' }}
        />
        <KPICard
          title="Pending Payouts"
          value={`₹${stats.pendingPayouts}`}
          icon="💸"
          color="bg-red-50"
          onClick={() => router.push('/admin/payouts')}
        />
        <KPICard
          title="Active Ads"
          value={stats.activeAds}
          icon="📢"
          color="bg-purple-50"
          onClick={() => router.push('/admin/ads')}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Pending Comments"
          value={stats.pendingComments}
          icon="💬"
          color="bg-orange-50"
          onClick={() => router.push('/admin/submissions')}
        />
        <KPICard
          title="Cube Logos"
          value={stats.cubeLogos}
          icon="🏢"
          color="bg-indigo-50"
          onClick={() => router.push('/admin/cube-logos')}
        />
        <KPICard
          title="Active Admins"
          value={stats.activeAdmins}
          icon="🔑"
          color="bg-cyan-50"
          onClick={() => router.push('/admin/admin-management')}
        />
        <KPICard
          title="Failed Logins"
          value={stats.failedLogins}
          icon="⚠️"
          color="bg-pink-50"
          onClick={() => router.push('/admin/login-sessions')}
        />
        <KPICard
          title="Last Backup"
          value={stats.lastBackup}
          icon="💾"
          color="bg-gray-50"
          onClick={() => router.push('/admin/backup')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>📊 Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-green-600">✓</span> <strong>Rehaman</strong> approved 3 posts • 5 min ago
            </p>
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-blue-600">ℹ️</span> <strong>Rahul</strong> processed payout ₹500 • 15 min ago
            </p>
            <p className="flex items-center gap-2 pb-2 border-b">
              <span className="text-purple-600">📢</span> <strong>Admin</strong> uploaded new ad campaign • 30 min ago
            </p>
            <p className="flex items-center gap-2">
              <span className="text-yellow-600">📝</span> <strong>Moderator</strong> created quiz slot #12 • 1 hour ago
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/activity-monitor')}
            className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition font-semibold"
          >
            View Full Activity Log →
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
