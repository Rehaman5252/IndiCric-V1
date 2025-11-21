'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const RecentHistory = dynamic(() => import('./RecentHistory'), {
  loading: () => <HistorySkeleton count={3} />,
  ssr: false,
});

const AllHistory = dynamic(() => import('./AllHistory'), {
  loading: () => <HistorySkeleton count={5} />,
  ssr: false,
});

const PerfectScoresHistory = dynamic(() => import('./PerfectScoresHistory'), {
  loading: () => <HistorySkeleton count={2} />,
  ssr: false,
});

const HistorySkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4 pt-4">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
);

export default function HistoryContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'perfect'>('recent');

  if (loading) {
    return <HistorySkeleton count={5} />;
  }

  if (!user) {
    return (
      <div className="pt-8 text-center">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Please log in to view your history.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'recent' | 'all' | 'perfect')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="perfect">Perfect Scores</TabsTrigger>
        </TabsList>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {/* Only render the active tab content */}
          {activeTab === 'recent' && <RecentHistory />}
          {activeTab === 'all' && <AllHistory />}
          {activeTab === 'perfect' && <PerfectScoresHistory />}
        </motion.div>
      </Tabs>
    </div>
  );
}
