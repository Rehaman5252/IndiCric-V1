import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { PaymentRequest, PaymentStats } from '@/types/payment';

/**
 * Create a payment request when user scores 5/5
 */
export const createPaymentRequest = async (
  userId: string,
  quizId: string,
  score: number,
  totalQuestions: number
): Promise<string | null> => {
  try {
    // Only create payment for perfect score
    if (score !== totalQuestions) {
      return null;
    }

    // Fetch user details
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    // Create payment request
    const paymentData = {
      userId,
      userName: userData.name || 'Unknown User',
      userEmail: userData.email || '',
      userPhone: userData.phone || '',
      userUpi: userData.upi || '',
      amount: 100, // ₹100 reward
      quizId,
      score,
      totalQuestions,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'paymentRequests'), paymentData);
    console.log('✅ Payment request created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating payment request:', error);
    throw error;
  }
};

/**
 * Get all payment requests with optional status filter
 */
export const getAllPaymentRequests = async (
  status?: 'pending' | 'completed' | 'failed'
): Promise<PaymentRequest[]> => {
  try {
    let q;

    if (status) {
      q = query(
        collection(db, 'paymentRequests'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'paymentRequests'),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as PaymentRequest)
    );
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    throw error;
  }
};

/**
 * Mark payment as completed
 */
export const markPaymentCompleted = async (
  paymentId: string,
  adminEmail: string,
  notes?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'paymentRequests', paymentId), {
      status: 'completed',
      completedAt: Timestamp.now(),
      completedBy: adminEmail,
      notes: notes || '',
    });
    console.log('✅ Payment marked as completed:', paymentId);
  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
};

/**
 * Mark payment as failed
 */
export const markPaymentFailed = async (
  paymentId: string,
  adminEmail: string,
  failureReason: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'paymentRequests', paymentId), {
      status: 'failed',
      completedAt: Timestamp.now(),
      completedBy: adminEmail,
      failureReason,
    });
    console.log('❌ Payment marked as failed:', paymentId);
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    throw error;
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const allPayments = await getAllPaymentRequests();

    const stats: PaymentStats = {
      totalPayments: allPayments.length,
      pendingPayments: allPayments.filter((p) => p.status === 'pending').length,
      completedPayments: allPayments.filter((p) => p.status === 'completed').length,
      failedPayments: allPayments.filter((p) => p.status === 'failed').length,
      totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: allPayments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      completedAmount: allPayments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
};
