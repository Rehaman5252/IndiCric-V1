'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import UserGrowthChart from './UserGrowthChart';
import QuizStatsChart from './QuizStatsChart';
import RevenueChart from './RevenueChart';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 shadow-lg border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Daily Active Users</p>
            <p className="text-4xl font-bold text-green-700 mt-2">340</p>
            <p className="text-xs text-green-600 mt-2">↑ 15% from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 shadow-lg border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Quiz Completion Rate</p>
            <p className="text-4xl font-bold text-blue-700 mt-2">78%</p>
            <p className="text-xs text-blue-600 mt-2">↑ 5% from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 shadow-lg border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Session Duration</p>
            <p className="text-4xl font-bold text-purple-700 mt-2">12m 45s</p>
            <p className="text-xs text-purple-600 mt-2">↑ 2m from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <UserGrowthChart />
      <QuizStatsChart />
      <RevenueChart />
    </div>
  );
}
