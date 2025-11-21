'use client';

import { useEffect, useState } from 'react';
import { getAdAnalytics } from '@/lib/ad-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Analytics {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalRevenue: number;
}

export default function AdAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAdAnalytics();
        setAnalytics(data);
        console.log('📊 Analytics loaded:', data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center py-8">⏳ Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Ads */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-400">📦 Total Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">{analytics.totalAds}</p>
        </CardContent>
      </Card>

      {/* Active Ads */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-400">✅ Active Ads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-400">{analytics.activeAds}</p>
        </CardContent>
      </Card>

      {/* Total Views */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-400">👁️ Total Views</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-400">{analytics.totalViews.toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-400">💰 Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-400">₹{analytics.totalRevenue.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
