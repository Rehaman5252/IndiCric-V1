'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HelpCircle, Megaphone, FileText, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      icon: Users,
      title: 'Total Users',
      value: 1240,
      color: 'bg-blue-600',
    },
    {
      icon: FileText,
      title: 'Pending Submissions',
      value: 5,
      color: 'bg-yellow-600',
    },
    {
      icon: HelpCircle,
      title: 'Active Quizzes',
      value: 3,
      color: 'bg-green-600',
    },
    {
      icon: Megaphone,
      title: 'Total Ads',
      value: 12,
      color: 'bg-purple-600',
    },
    {
      icon: DollarSign,
      title: 'Payouts Pending',
      value: '₹2500',
      color: 'bg-red-600',
    },
    {
      icon: TrendingUp,
      title: 'Total Earnings',
      value: '₹45000',
      color: 'bg-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-lg">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold">Welcome to IndCric Admin Panel! 🎉</h2>
          <p className="text-green-100 mt-2">You're logged in as a superadmin. Full access to all modules.</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${stat.color}`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-semibold text-blue-700">
              👥 View Users
            </button>
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition font-semibold text-yellow-700">
              ⏳ Review Submissions
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition font-semibold text-green-700">
              ❓ Create Quiz
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition font-semibold text-purple-700">
              📢 Upload Ad
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
