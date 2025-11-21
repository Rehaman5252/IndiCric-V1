'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const RecentHistory = dynamic(() => import('./RecentHistory'), {
  loading: () => <HistorySkeleton count={1} />,
  ssr: false,
});
const AllHistory = dynamic(() => import('./AllHistory'), {
  loading: () => <HistorySkeleton count={3} />,
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
  const router = useRouter();

  if (loading) {
    return <HistorySkeleton count={5} />;
  }

  // Reusable signed-out layout component
  const SignedOutView = ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-250px)] px-4 text-center"
    >
      <div className="relative mx-auto mb-6 w-16 h-16 rounded-full bg-[#081221] flex items-center justify-center shadow-inner">
        {icon}
      </div>

      <h2 className="text-3xl font-semibold text-white mb-3">{title}</h2>
      <p className="max-w-xl text-base text-slate-300 mb-8 leading-relaxed">{description}</p>

      <button
        onClick={() => router.push('/auth/login?')}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-yellow-400 text-slate-900 font-medium shadow-md hover:brightness-95 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12H3m0 0l4 4m-4-4l4-4m9 8h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3"
          />
        </svg>
        Sign In / Sign Up
      </button>
    </motion.div>
  );

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'recent' | 'all' | 'perfect')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-md overflow-hidden">
          <TabsTrigger value="recent" className={activeTab === 'recent' ? 'bg-yellow-400 text-slate-900' : ''}>
            Recent Innings
          </TabsTrigger>
          <TabsTrigger value="all" className={activeTab === 'all' ? 'bg-yellow-400 text-slate-900' : ''}>
            All Innings
          </TabsTrigger>
          <TabsTrigger value="perfect" className={activeTab === 'perfect' ? 'bg-yellow-400 text-slate-900' : ''}>
            Perfect Scores
          </TabsTrigger>
        </TabsList>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4"
        >
          {/* ✅ Recent Tab */}
          <TabsContent value="recent" className="w-full">
            {user ? (
              <RecentHistory />
            ) : (
              <SignedOutView
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C23A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-history"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                }
                title="Review Your Recent Innings"
                description="Sign in to analyze your most recent performance and learn from your mistakes."
              />
            )}
          </TabsContent>

          {/* ✅ All Innings Tab — custom message */}
          <TabsContent value="all" className="w-full">
            {user ? (
              <AllHistory />
            ) : (
              <SignedOutView
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C23A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trending-up"
                  >
                    <path d="M3 17l6-6 4 4 8-8" />
                    <path d="M21 7h-5V2" />
                  </svg>
                }
                title="View Your Career Stats"
                description="Every match you've played is recorded here. Sign in to see your complete cricket journey."
              />
            )}
          </TabsContent>

          {/* ✅ Perfect Scores Tab */}
          <TabsContent value="perfect" className="w-full">
            {user ? (
              <PerfectScoresHistory />
            ) : (
              <SignedOutView
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F6C23A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star"
                  >
                    <polygon points="12 2 15 8.5 22 9.3 17 14 18.3 21 12 17.8 5.7 21 7 14 2 9.3 9 8.5 12 2" />
                  </svg>
                }
                title="Perfect Scores"
                description="Your perfect innings will appear here. Sign in to track your flawless performances."
              />
            )}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}