import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersLastMonth: number;
  perfectScores: number;
  pendingSubmissions: number;
  totalPayouts: number;
  pendingPayouts: number;
  processedPayouts: number;
}

export function subscribeToDashboardMetrics(
  callback: (metrics: DashboardMetrics) => void
) {
  let currentMetrics: DashboardMetrics = {
    totalUsers: 0,
    activeUsersToday: 0,
    activeUsersThisWeek: 0,
    activeUsersLastMonth: 0,
    perfectScores: 0,
    pendingSubmissions: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    processedPayouts: 0,
  };

  const updateMetrics = () => callback({ ...currentMetrics });

  const now = new Date();

  // ===== 1. TOTAL USERS =====
  const usersUnsub = onSnapshot(
    collection(db, 'users'),
    snapshot => {
      currentMetrics.totalUsers = snapshot.size;
      console.log('✅ Total Users:', currentMetrics.totalUsers);
      updateMetrics();
    },
    error => console.error('❌ Users error:', error)
  );

  // ===== 2. ACTIVE USERS FROM quizAttempts =====
  const quizAttemptsUnsub = onSnapshot(
    collection(db, 'quizAttempts'),
    snapshot => {
      console.log('📊 QuizAttempts docs found:', snapshot.size);

      const todayUsers = new Set<string>();
      const weekUsers = new Set<string>();
      const monthUsers = new Set<string>();

      // TODAY
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // THIS WEEK (last 7 days)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // LAST MONTH (last 30 days)
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      snapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        let attemptDate = new Date(0);

        // Parse timestamp properly
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            attemptDate = data.timestamp.toDate();
          } else if (data.timestamp instanceof Date) {
            attemptDate = data.timestamp;
          } else {
            attemptDate = new Date(data.timestamp);
          }
        }

        if (userId) {
          // Check date ranges
          if (attemptDate >= todayStart) todayUsers.add(userId);
          if (attemptDate >= sevenDaysAgo) weekUsers.add(userId);
          if (attemptDate >= thirtyDaysAgo) monthUsers.add(userId);
        }
      });

      currentMetrics.activeUsersToday = todayUsers.size;
      currentMetrics.activeUsersThisWeek = weekUsers.size;
      currentMetrics.activeUsersLastMonth = monthUsers.size;

      console.log('✅ Active Today:', currentMetrics.activeUsersToday);
      console.log('✅ Active This Week:', currentMetrics.activeUsersThisWeek);
      console.log('✅ Active Last Month:', currentMetrics.activeUsersLastMonth);
      updateMetrics();
    },
    error => {
      console.error('❌ QuizAttempts error:', error);
      updateMetrics();
    }
  );

  // ===== 3. PERFECT SCORES FROM paymentRequests =====
  const perfectScoresUnsub = onSnapshot(
    collection(db, 'paymentRequests'),
    snapshot => {
      currentMetrics.perfectScores = snapshot.size; // Count all payment requests (each = 1 perfect score)
      console.log('✅ Perfect Scores:', currentMetrics.perfectScores);
      updateMetrics();
    },
    error => console.error('❌ Perfect scores error:', error)
  );

  // ===== 4. PENDING SUBMISSIONS =====
  const submissionsUnsub = onSnapshot(
    collection(db, 'submissions'),
    snapshot => {
      let pending = 0;
      snapshot.forEach(doc => {
        if (doc.data().status === 'pending') pending++;
      });
      currentMetrics.pendingSubmissions = pending;
      console.log('✅ Pending Submissions:', currentMetrics.pendingSubmissions);
      updateMetrics();
    },
    error => {
      console.error('❌ Submissions error:', error);
      updateMetrics();
    }
  );

  // ===== 5. PAYOUTS FROM paymentRequests =====
  const payoutsUnsub = onSnapshot(
    collection(db, 'paymentRequests'),
    snapshot => {
      let totalPayouts = 0;
      let pendingPayouts = 0;
      let processedPayouts = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        const status = data.status;

        totalPayouts += amount;

        if (status === 'pending') {
          pendingPayouts += amount;
        } else if (status === 'completed') {
          processedPayouts += amount;
        }
      });

      currentMetrics.totalPayouts = totalPayouts;
      currentMetrics.pendingPayouts = pendingPayouts;
      currentMetrics.processedPayouts = processedPayouts;

      console.log('✅ Total Payouts:', currentMetrics.totalPayouts);
      console.log('✅ Pending Payouts:', currentMetrics.pendingPayouts);
      console.log('✅ Processed Payouts:', currentMetrics.processedPayouts);
      updateMetrics();
    },
    error => {
      console.error('❌ Payouts error:', error);
      updateMetrics();
    }
  );

  console.log('🚀 Dashboard initialized');

  return () => {
    console.log('🛑 Unsubscribing');
    usersUnsub();
    quizAttemptsUnsub();
    perfectScoresUnsub();
    submissionsUnsub();
    payoutsUnsub();
  };
}
