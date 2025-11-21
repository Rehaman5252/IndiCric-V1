'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdUploadForm from '@/app/components/admin/AdUploadForm';
import AdAnalytics from '@/app/components/admin/AdAnalytics';
import AdsList from '@/app/components/admin/AdsList';
import { useState } from 'react';

export default function AdUploadPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AdminAuthGuard requiredPermissions={['ads:manage']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-black text-white mb-2">🎬 Ads Management</h1>
            <p className="text-gray-400">Upload, manage, and track advertisement campaigns</p>
          </div>

          {/* Analytics Dashboard */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
            <AdAnalytics key={refreshKey} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className="lg:col-span-2">
              <AdUploadForm />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-400 mb-2">💡 Tips</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Select a slot before uploading</li>
                  <li>• Video ads work best for Q3→Q4 & After Quiz</li>
                  <li>• Images work for cube faces & other transitions</li>
                  <li>• Redirect URL must be valid</li>
                  <li>• Revenue is counted instantly</li>
                </ul>
              </div>

              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-400 mb-2">11 Ad Slots</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>🎲 6 Cube Faces</li>
                  <li>❓ 5 Quiz Flow</li>
                </ul>
              </div>
            </div>
          </div>

          {/* All Ads List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">📋 All Advertisements</h2>
            <AdsList key={refreshKey} />
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
