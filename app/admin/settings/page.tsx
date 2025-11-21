'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage, clearSessionStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';
import { LogOut, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
  }, [router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearSessionStorage();
      router.push('/admin/login');
    }
  };

  if (!session) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">⚙️ System Settings</h1>

      {/* General Settings Card */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          🔧 General Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-yellow-500 font-semibold mb-2">App Name</label>
            <input
              type="text"
              value="IndCric"
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white opacity-60 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-yellow-500 font-semibold mb-2">Version</label>
            <input
              type="text"
              value="1.0.0"
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-600 transition">
            <input
              type="checkbox"
              disabled
              className="w-5 h-5 text-yellow-500 bg-gray-800 border-gray-700 rounded focus:ring-yellow-500 cursor-not-allowed"
            />
            <div>
              <span className="text-white font-semibold">Maintenance Mode</span>
              <p className="text-gray-400 text-sm">Temporarily disable app for all users</p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-30 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-200 text-sm font-semibold">Read-Only Settings</p>
            <p className="text-blue-300 text-xs mt-1">
              These are system-level settings. Contact your development team if changes are needed.
            </p>
          </div>
        </div>
      </div>

      {/* Account Actions Card */}
      <div className="bg-gray-900 border border-red-600 border-opacity-20 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">🔐 Account Actions</h2>
        <p className="text-gray-400 mb-6">Manage your admin session</p>
        
        <button
          onClick={handleLogout}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-3"
        >
          <LogOut className="h-6 w-6" />
          Logout from Admin Panel
        </button>
      </div>

      {/* Quick Tips Card */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500 border-opacity-30 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">💡 Admin Panel Tips</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-white font-semibold">Dashboard</p>
              <p className="text-purple-200 text-sm">View real-time statistics and user activity</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-white font-semibold">Finances</p>
              <p className="text-purple-200 text-sm">Manage withdrawals and monitor transactions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">❓</span>
            <div>
              <p className="text-white font-semibold">Quizzes</p>
              <p className="text-purple-200 text-sm">Create and edit quiz questions for users</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📢</span>
            <div>
              <p className="text-white font-semibold">Ads Management</p>
              <p className="text-purple-200 text-sm">Upload and manage advertisement campaigns</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-white font-semibold">Users</p>
              <p className="text-purple-200 text-sm">View and manage all registered users</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Info Card */}
      <div className="bg-gray-900 border border-yellow-600 border-opacity-20 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-3">ℹ️ System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Environment</p>
            <p className="text-white font-semibold">Production</p>
          </div>
          <div>
            <p className="text-gray-400">Platform</p>
            <p className="text-white font-semibold">Next.js 14 + Firebase</p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="text-white font-semibold">Nov 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
