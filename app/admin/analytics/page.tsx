'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
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

  if (!session) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">📈 Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Page Views</p>
          <p className="text-4xl font-black text-white mt-2">125K</p>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Sessions</p>
          <p className="text-4xl font-black text-white mt-2">45K</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Users</p>
          <p className="text-4xl font-black text-white mt-2">12K</p>
        </div>
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Bounce Rate</p>
          <p className="text-4xl font-black text-white mt-2">23%</p>
        </div>
      </div>
    </div>
  );
}
