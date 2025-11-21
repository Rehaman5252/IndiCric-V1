'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ADS_KEY = 'indcric_ads';

export default function ScheduleAdsPage() {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(ADS_KEY);
    if (stored) {
      setAds(JSON.parse(stored));
    }
  }, []);

  const updateSchedule = (id: string, fromDate: string, toDate: string) => {
    const updated = ads.map(a =>
      a.id === id ? { ...a, scheduleFrom: fromDate, scheduleTo: toDate } : a
    );
    setAds(updated);
    localStorage.setItem(ADS_KEY, JSON.stringify(updated));
    alert('Ad schedule updated!');
  };

  return (
    <AdminAuthGuard requiredPermissions={['ads:schedule']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Schedule Ads</h1>
            <p className="text-gray-600 mt-1">Manage advertisement schedules</p>
          </div>

          <div className="space-y-4">
            {ads.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <p className="text-gray-600">No ads found</p>
                </CardContent>
              </Card>
            ) : (
              ads.map(ad => (
                <Card key={ad.id} className="shadow-lg border-0">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold">{ad.title}</h3>
                          <p className="text-sm text-gray-600">{ad.type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ad.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Schedule From</label>
                          <input
                            type="datetime-local"
                            defaultValue={ad.scheduleFrom}
                            onChange={(e) => updateSchedule(ad.id, e.target.value, ad.scheduleTo)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Schedule To</label>
                          <input
                            type="datetime-local"
                            defaultValue={ad.scheduleTo}
                            onChange={(e) => updateSchedule(ad.id, ad.scheduleFrom, e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
