import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'fact' | 'question';
  status: 'pending' | 'approved' | 'rejected';
  
  content?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  
  createdAt: any;
  approvedAt?: any;
  approvedBy?: string;
}

export interface SubmissionMetrics {
  total: number;
  pending: number;
  approved: number;
  facts: number;
  questions: number;
}

// ✅ Submit a new fact or question
export async function submitContribution(
  userId: string,
  userName: string,
  userEmail: string,
  type: 'fact' | 'question',
  data: {
    content?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
  }
): Promise<string> {
  try {
    const submission = {
      userId,
      userName,
      userEmail,
      type,
      status: 'pending',
      createdAt: serverTimestamp(),
      ...data,
    };

    const docRef = await addDoc(collection(db, 'submissions'), submission);
    console.log('✅ Submission created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting contribution:', error);
    throw error;
  }
}

// ✅ Get all submissions (admin only)
export async function getAllSubmissions(): Promise<Submission[]> {
  try {
    const snapshot = await getDocs(collection(db, 'submissions'));
    const submissions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || '',
        userName: data.userName || '',
        userEmail: data.userEmail || '',
        type: data.type || 'fact',
        status: data.status || 'pending',
        content: data.content,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        createdAt: data.createdAt,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
      } as Submission;
    });
    console.log('📊 All submissions fetched:', submissions.length);
    return submissions;
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    return [];
  }
}

// ✅ Get user's submissions
export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Submission;
    });
  } catch (error) {
    console.error('❌ Error fetching user submissions:', error);
    return [];
  }
}

// ✅ Real-time listener for submission metrics
export function subscribeToSubmissionMetrics(
  callback: (metrics: SubmissionMetrics) => void
): (() => void) {
  console.log('🔔 Starting submission metrics listener...');

  const unsubscribe = onSnapshot(
    collection(db, 'submissions'),
    snapshot => {
      try {
        const submissions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type || 'fact',
            status: data.status || 'pending',
          };
        });

        const metrics: SubmissionMetrics = {
          total: submissions.length,
          pending: submissions.filter(s => s.status === 'pending').length,
          approved: submissions.filter(s => s.status === 'approved').length,
          facts: submissions.filter(s => s.type === 'fact').length,
          questions: submissions.filter(s => s.type === 'question').length,
        };

        console.log('📈 Metrics updated:', metrics);
        callback(metrics);
      } catch (error) {
        console.error('❌ Error processing metrics:', error);
      }
    },
    error => {
      console.error('❌ Error listening to submissions:', error);
    }
  );

  return unsubscribe;
}

// ✅ FIXED: Approve submission - NO MORE UNDEFINED ERROR
export async function approveSubmission(
  submissionId: string,
  adminId: string
): Promise<void> {
  try {
    // ✅ FIX: Only update if adminId is provided
    if (!adminId) {
      console.warn('⚠️ Admin ID not provided, approving without recording approver');
    }

    console.log('✅ Approving submission:', submissionId, 'by admin:', adminId);
    
    const submissionRef = doc(db, 'submissions', submissionId);
    
    const updateData: any = {
      status: 'approved',
      approvedAt: serverTimestamp(),
    };

    // Only add approvedBy if adminId exists
    if (adminId) {
      updateData.approvedBy = adminId;
    }

    await updateDoc(submissionRef, updateData);
    console.log('✅ Submission approved successfully');
  } catch (error) {
    console.error('❌ Error approving submission:', error);
    throw error;
  }
}

// ✅ Reject submission (admin only)
export async function rejectSubmission(submissionId: string): Promise<void> {
  try {
    console.log('❌ Rejecting submission:', submissionId);
    const submissionRef = doc(db, 'submissions', submissionId);
    await updateDoc(submissionRef, {
      status: 'rejected',
    });
    console.log('✅ Submission rejected successfully');
  } catch (error) {
    console.error('❌ Error rejecting submission:', error);
    throw error;
  }
}

// ✅ Get pending submissions only
export async function getPendingSubmissions(): Promise<Submission[]> {
  try {
    console.log('⏳ Fetching pending submissions...');
    
    const snapshot = await getDocs(collection(db, 'submissions'));
    
    const submissions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || '',
          userEmail: data.userEmail || '',
          type: data.type || 'fact',
          status: data.status || 'pending',
          content: data.content,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          createdAt: data.createdAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy,
        } as Submission;
      })
      .filter(s => s.status === 'pending');

    console.log('📋 Pending submissions:', submissions.length);
    return submissions;
  } catch (error) {
    console.error('❌ Error fetching pending submissions:', error);
    return [];
  }
}

// ✅ Get approved submissions only
export async function getApprovedSubmissions(): Promise<Submission[]> {
  try {
    const snapshot = await getDocs(collection(db, 'submissions'));
    const submissions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Submission;
      })
      .filter(s => s.status === 'approved');
    
    return submissions;
  } catch (error) {
    console.error('❌ Error fetching approved submissions:', error);
    return [];
  }
}

// ✅ Get user's approved count by type
export async function getUserApprovedCount(
  userId: string,
  type: 'fact' | 'question'
): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'submissions'));
    
    const count = snapshot.docs.filter(doc => {
      const data = doc.data();
      return (
        data.userId === userId &&
        data.type === type &&
        data.status === 'approved'
      );
    }).length;

    console.log(`✅ User approved ${type} count:`, count);
    return count;
  } catch (error) {
    console.error(`❌ Error fetching user approved ${type} count:`, error);
    return 0;
  }
}
