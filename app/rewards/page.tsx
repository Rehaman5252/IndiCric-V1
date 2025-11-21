import { Suspense } from 'react';
import RewardsContent from '@/components/rewards/RewardsContent';
import GenericOffers from '@/components/rewards/GenericOffers';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Rewards | Ind Cric',
  description: 'View your rewards and exclusive partner offers',
};

export default function RewardsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Rewards</h1>
      </div>
      
      <div className="space-y-8">
        <Suspense fallback={<RewardsSkeleton />}>
          <RewardsContent />
        </Suspense>

        <Suspense fallback={<OffersSkeleton />}>
          <GenericOffers />
        </Suspense>
      </div>
    </div>
  );
}

function RewardsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}

function OffersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
