'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';

export default function ContentPage() {
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
      <h1 className="text-4xl font-black text-white">📝 Content Moderation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Pending Review</p>
          <p className="text-4xl font-black text-white mt-2">24</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Flagged</p>
          <p className="text-4xl font-black text-white mt-2">3</p>
        </div>
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-8 shadow-lg">
          <p className="text-white text-sm font-semibold opacity-90">Approved Today</p>
          <p className="text-4xl font-black text-white mt-2">156</p>
        </div>
      </div>

      <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:shadow-lg transition">
        ✅ Review Content
      </button>
    </div>
  );
}
