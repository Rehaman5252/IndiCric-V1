'use client';

import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdUploadForm from '@/app/components/admin/AdUploadForm';
import AdsList from '@/app/components/admin/AdsList';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, BarChart3, XCircle } from 'lucide-react';

interface Ad {
  id: string;
  companyName: string;
  adSlot: string;
  adType: 'image' | 'video';
  mediaUrl: string;
  redirectUrl: string;
  revenue: number;
  viewCount: number;
  clickCount: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

type ViewMode = 'none' | 'total' | 'active' | 'deactivated' | 'revenue';

export default function AdUploadPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('none');
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    deactivatedAds: 0,
    totalRevenue: 0
  });

  // Fetch stats from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'ads'));
        const adsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ad[];

        const totalRevenue = adsData.reduce((sum, ad) => sum + (ad.revenue || 0), 0);
        const activeAds = adsData.filter(ad => ad.isActive).length;
        const deactivatedAds = adsData.filter(ad => !ad.isActive).length;

        setStats({
          totalAds: adsData.length,
          activeAds,
          deactivatedAds,
          totalRevenue
        });

        console.log('📊 Stats loaded:', { totalAds: adsData.length, activeAds, deactivatedAds });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [refreshKey]);

  return (
    <AdminAuthGuard requiredPermissions={['ads:manage']}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-white mb-2">🎬 Ads Management</h1>
          <p className="text-gray-400">Upload, manage, and track advertisement campaigns</p>
        </div>

        {/* Interactive Stats Cards - CLICKABLE BUTTONS */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics Dashboard</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Ads Card */}
            <Card 
              className={`cursor-pointer transition-all hover:scale-105 ${viewMode === 'total' ? 'ring-2 ring-blue-500' : ''} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800`}
              onClick={() => setViewMode(viewMode === 'total' ? 'none' : 'total')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">🎯 Total Ads</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalAds}</div>
                <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
              </CardContent>
            </Card>

            {/* Active Ads Card */}
            <Card 
              className={`cursor-pointer transition-all hover:scale-105 ${viewMode === 'active' ? 'ring-2 ring-green-500' : ''} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800`}
              onClick={() => setViewMode(viewMode === 'active' ? 'none' : 'active')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">✅ Active Ads</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.activeAds}</div>
                <p className="text-xs text-muted-foreground mt-1">Click to manage</p>
              </CardContent>
            </Card>

            {/* Deactivated Ads Card */}
            <Card 
              className={`cursor-pointer transition-all hover:scale-105 ${viewMode === 'deactivated' ? 'ring-2 ring-red-500' : ''} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800`}
              onClick={() => setViewMode(viewMode === 'deactivated' ? 'none' : 'deactivated')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">⏸️ Deactivated</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.deactivatedAds}</div>
                <p className="text-xs text-muted-foreground mt-1">Click to reactivate</p>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card 
              className={`cursor-pointer transition-all hover:scale-105 ${viewMode === 'revenue' ? 'ring-2 ring-yellow-500' : ''} bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800`}
              onClick={() => setViewMode(viewMode === 'revenue' ? 'none' : 'revenue')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">💰 Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Sort by revenue</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips - ALWAYS VISIBLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-400 mb-2">💡 Tips</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Click stat cards above to filter ads</li>
              <li>• New ads are created as ACTIVE by default</li>
              <li>• Active Ads: Full management (edit/delete/deactivate)</li>
              <li>• Deactivated Ads: Easily reactivate ads</li>
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-400 mb-2">11 Ad Slots Available</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>🎲 6 Cube Faces (image ads)</li>
              <li>❓ 5 Quiz Flow (image/video ads)</li>
            </ul>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-3">
            <AdUploadForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>

        {/* Ads List with Filter */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {viewMode === 'total' && '📋 All Advertisements'}
              {viewMode === 'active' && '✅ Active Advertisements'}
              {viewMode === 'deactivated' && '⏸️ Deactivated Advertisements'}
              {viewMode === 'revenue' && '💰 Ads Sorted by Revenue'}
              {viewMode === 'none' && '📋 All Advertisements'}
            </h2>
            {viewMode !== 'none' && (
              <Button 
                variant="outline" 
                onClick={() => setViewMode('none')}
                className="text-sm"
              >
                Clear Filter
              </Button>
            )}
          </div>
          <AdsList 
            key={`${refreshKey}-${viewMode}`} 
            filterMode={viewMode}
            onUpdate={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>
    </AdminAuthGuard>
  );
}
