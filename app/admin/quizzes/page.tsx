'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionFromStorage } from '@/lib/admin-auth';
import QuizSummaryCards from '@/app/components/admin/quizzes/QuizSummaryCards';
import QuizScheduleManager from '@/app/components/admin/quizzes/QuizScheduleManager';
import QuestionPoolManager from '@/app/components/admin/quizzes/QuestionPoolManager';
import AIGenerationMonitor from '@/app/components/admin/quizzes/AIGenerationMonitor';
import QuizInsightsPanel from '@/app/components/admin/quizzes/QuizInsightsPanel';
import {
  mockQuizAnalytics,
  mockQuizSlots,
  mockQuestionPools,
  mockAIGenerationStatus,
  mockQuizInsights,
} from '@/lib/quiz-data';
import { Plus, Calendar } from 'lucide-react';

export default function QuizzesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
    setLoading(false);
  }, [router]);

  if (loading || !session) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">❓ Quizzes Management</h1>
          <p className="text-gray-400 mt-2">AI-powered quiz generation, scheduling, and analytics</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition">
            <Plus className="h-5 w-5" />
            Create Quiz
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition">
            <Calendar className="h-5 w-5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Quiz Summary Cards */}
      <QuizSummaryCards analytics={mockQuizAnalytics} />

      {/* Quiz Schedule Manager */}
      <QuizScheduleManager slots={mockQuizSlots} />

      {/* Question Pool Manager */}
      <QuestionPoolManager pools={mockQuestionPools} />

      {/* AI Generation Monitor */}
      <AIGenerationMonitor status={mockAIGenerationStatus} />

      {/* Quiz Insights */}
      <QuizInsightsPanel insights={mockQuizInsights} />

      {/* System Alerts */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 border border-red-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">🚨 Critical System Alerts</h3>
        <div className="space-y-2">
          <p className="text-red-200">⚠️ Question Pool "IPL Hard" critically low: Only 1,690 questions remaining</p>
          <p className="text-red-200">❌ Slot #1544 (1:20 PM) was cancelled due to AI failure and pool exhaustion</p>
          <p className="text-orange-200">⏳ 8 pending slots waiting for AI question generation</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs py-4 border-t border-gray-800">
        <p>AI Provider: Gemini 2.0 | Last sync: Just now | Pool health check: Good ✅</p>
      </div>
    </div>
  );
}
