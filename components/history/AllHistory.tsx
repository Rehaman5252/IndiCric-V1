'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import QuizHistoryContent from './QuizHistoryContent';
import type { QuizAttempt } from '@/ai/schemas';
import { mapFirestoreError } from '@/lib/utils';

export default function AllHistory() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    if (!user?.uid) {
      setAttempts([]);
      setIsLoading(false);
      setError(null);
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
          const data = snapshot.docs.map(doc => ({
            ...doc.data(),
            slotId: doc.id,
          } as QuizAttempt));
          setAttempts(data);
          setIsLoading(false);
        },
        (err) => {
          console.error('All history error:', err);
          setError(mapFirestoreError(err).userMessage || 'Failed to load all history');
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up all history listener:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return <QuizHistoryContent attempts={attempts} isLoading={isLoading} error={error} />;
}