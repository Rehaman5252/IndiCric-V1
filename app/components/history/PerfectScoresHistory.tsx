'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import QuizHistoryContent from './QuizHistoryContent';
import type { QuizAttempt } from '@/ai/schemas';

export default function PerfectScoresHistory() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      console.log('No user or db:', { user: !!user, db: !!db });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe | null = null;

    try {
      const q = query(
        collection(db, 'users', user.uid, 'quizAttempts'),
        orderBy('timestamp', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('📊 Total attempts fetched:', snapshot.docs.length);
          
          // Filter for perfect scores
          const data = snapshot.docs
            .map(doc => {
              const docData = doc.data();
              console.log('📝 Attempt data:', {
                score: docData.score,
                totalQuestions: docData.totalQuestions,
                reason: docData.reason
              });
              return {
                ...docData,
                slotId: doc.id,
              } as QuizAttempt;
            })
            .filter(attempt => {
              const isPerfect = attempt.score === attempt.totalQuestions && !attempt.reason;
              console.log(`🎯 Checking if perfect (${attempt.score}/${attempt.totalQuestions}, reason: ${attempt.reason}):`, isPerfect);
              return isPerfect;
            });
          
          console.log('✅ Perfect scores found:', data.length);
          setAttempts(data);
          setIsLoading(false);
        },
        (err) => {
          console.error('❌ Error fetching perfect scores:', err);
          console.error('Error code:', err.code);
          console.error('Error message:', err.message);
          setError('Unable to load perfect scores. Please try again later.');
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('❌ Exception setting up listener:', err);
      setError('Failed to load quiz history.');
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return <QuizHistoryContent attempts={attempts} isLoading={isLoading} error={error} />;
}
