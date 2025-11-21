// app/walkthrough/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import GuidedTour from '@/components/home/GuidedTour';

export default function WalkthroughPage() {
  const { profile, updateUserData } = useAuth();
  const router = useRouter();

  const handleTourFinish = async () => {
    if (profile) {
      try {
        await updateUserData({ guidedTourCompleted: true });
        router.replace('/');
      } catch (error) {
        console.error("Failed to update tour status:", error);
        router.replace('/');
      }
    } else {
        router.replace('/');
    }
  };

  // ✅ FIXED: Ensure needsTour is always boolean, never null
  const needsTour = profile ? !profile.guidedTourCompleted : false;

  if (profile === null) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
      <div className="p-4">
          {/* ✅ FIXED: needsTour is now always boolean */}
          <GuidedTour run={needsTour} onFinish={handleTourFinish} />
      </div>
  );
}
