// lib/user-management-service.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { logger } from '@/app/lib/logger';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  lastLogin: string;
  lastQuizTaken: string;
}

export interface UserMetrics {
  totalUsers: number;
  activeTodayUsers: string[];
  activeWeekUsers: string[];
  activeMonthUsers: string[];
}

// Helper function to safely parse timestamps - IMPROVED
function formatDateToString(timestamp: any): string {
  try {
    let dateObj: Date | null = null;

    // Check 1: Firestore Timestamp object with toDate() method
    if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    }
    // Check 2: Object with seconds property (Firestore format)
    else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    }
    // Check 3: Already a Date
    else if (timestamp instanceof Date) {
      dateObj = timestamp;
    }
    // Check 4: Number (milliseconds)
    else if (typeof timestamp === 'number') {
      dateObj = new Date(timestamp);
    }
    // Check 5: String
    else if (typeof timestamp === 'string') {
      dateObj = new Date(timestamp);
    }

    // If we got a valid date, format it
    if (dateObj && !isNaN(dateObj.getTime())) {
      // Format: "8/11/2025, 10:35:56 pm"
      return dateObj.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    return 'N/A';
  } catch (error) {
    console.error('Timestamp formatting error:', error, 'Input:', timestamp);
    return 'N/A';
  }
}

export function subscribeToUserMetrics(callback: (metrics: UserMetrics) => void) {
  let currentMetrics: UserMetrics = {
    totalUsers: 0,
    activeTodayUsers: [],
    activeWeekUsers: [],
    activeMonthUsers: [],
  };

  const updateMetrics = () => callback({ ...currentMetrics });
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const usersUnsub = onSnapshot(collection(db, 'users'), snapshot => {
    currentMetrics.totalUsers = snapshot.size;
    updateMetrics();
  });

  const quizAttemptsUnsub = onSnapshot(collection(db, 'quizAttempts'), snapshot => {
    const todaySet = new Set<string>();
    const weekSet = new Set<string>();
    const monthSet = new Set<string>();

    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      
      let attemptDate: Date | null = null;
      
      if (data.timestamp) {
        if (typeof data.timestamp.toDate === 'function') {
          attemptDate = data.timestamp.toDate();
        } else if (data.timestamp && data.timestamp.seconds) {
          attemptDate = new Date(data.timestamp.seconds * 1000);
        } else if (data.timestamp instanceof Date) {
          attemptDate = data.timestamp;
        } else if (typeof data.timestamp === 'number') {
          attemptDate = new Date(data.timestamp);
        }
      }

      if (userId && attemptDate && !isNaN(attemptDate.getTime())) {
        if (attemptDate >= todayStart) todaySet.add(userId);
        if (attemptDate >= sevenDaysAgo) weekSet.add(userId);
        if (attemptDate >= thirtyDaysAgo) monthSet.add(userId);
      }
    });

    currentMetrics.activeTodayUsers = Array.from(todaySet);
    currentMetrics.activeWeekUsers = Array.from(weekSet);
    currentMetrics.activeMonthUsers = Array.from(monthSet);

    updateMetrics();
  });

  return () => {
    usersUnsub();
    quizAttemptsUnsub();
  };
}

export async function getAllUsersWithDetails(): Promise<UserData[]> {
  const userDocs = await getDocs(collection(db, 'users'));
  const users: UserData[] = [];

  for (const userDoc of userDocs.docs) {
    const d = userDoc.data();
    
    let lastLogin = 'N/A';
    let lastQuizTaken = 'N/A';
    
    // ✅ FIXED: Parse lastPlayedAt properly
    if (d.lastPlayedAt) {
      try {
        let date: Date;
        
        // Check if it's a Firestore Timestamp with toDate method
        if (d.lastPlayedAt && typeof d.lastPlayedAt.toDate === 'function') {
          date = d.lastPlayedAt.toDate();
        }
        // Check if it has seconds property
        else if (d.lastPlayedAt && d.lastPlayedAt.seconds) {
          date = new Date(d.lastPlayedAt.seconds * 1000);
        }
        // Already a Date
        else if (d.lastPlayedAt instanceof Date) {
          date = d.lastPlayedAt;
        }
        // String format
        else if (typeof d.lastPlayedAt === 'string') {
          date = new Date(d.lastPlayedAt);
        }
        else {
          throw new Error('Unknown timestamp format');
        }
        
        // Format date
        if (!isNaN(date.getTime())) {
          lastLogin = new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      } catch (e) {
        console.error('Error parsing lastPlayedAt for', d.email, ':', e);
        lastLogin = 'N/A';
      }
    }

    // Get last quiz attempt (with workaround - no index needed)
    try {
      const allQuizDocs = await getDocs(
        query(collection(db, 'quizAttempts'), where('userId', '==', userDoc.id))
      );
      
      if (allQuizDocs.size > 0) {
        // Get all attempts and sort manually
        let latestTimestamp: any = null;
        let latestDate: Date | null = null;
        
        allQuizDocs.docs.forEach(doc => {
          const attempt = doc.data();
          let attemptDate: Date | null = null;
          
          if (attempt.timestamp) {
            if (typeof attempt.timestamp.toDate === 'function') {
              attemptDate = attempt.timestamp.toDate();
            } else if (attempt.timestamp.seconds) {
              attemptDate = new Date(attempt.timestamp.seconds * 1000);
            }
          }
          
          // Keep track of the most recent
          if (attemptDate && (!latestDate || attemptDate > latestDate)) {
            latestDate = attemptDate;
          }
        });
        
        if (latestDate && !isNaN(latestDate.getTime())) {
          lastQuizTaken = latestDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      }
    } catch (e) {
      console.warn('Could not fetch quiz attempts for', d.email);
    }

    users.push({
      uid: userDoc.id,
      displayName: d.name || 'Unknown',
      email: d.email || 'N/A',
      phoneNumber: d.phone || 'N/A',
      lastLogin,
      lastQuizTaken,
    });
  }

  console.log('✅ All users loaded:', users.length);
  return users;
}


export async function getUsersByIdsWithDetails(userIds: string[]): Promise<UserData[]> {
  if (userIds.length === 0) return [];
  const allUsers = await getAllUsersWithDetails();
  return allUsers.filter(u => userIds.includes(u.uid));
}

export async function deleteUser(userId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId));
  logger.info('User deleted:', userId);
}
