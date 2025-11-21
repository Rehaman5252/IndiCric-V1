import { Timestamp } from 'firebase/firestore';

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userUpi: string;
  amount: number;
  quizId: string;
  score: number;
  totalQuestions: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string; // Admin email
  notes?: string;
  failureReason?: string;
}

export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
}
