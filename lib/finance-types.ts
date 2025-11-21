export interface QuizSlot {
  id: string;
  slotTime: string; // "1:00 PM - 1:10 PM"
  startTime: Date;
  endTime: Date;
  entryFee: number;
  totalParticipants: number;
  winners: number;
  prizePool: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
}

export interface Winner {
  id: string;
  userId: string;
  username: string;
  email: string;
  upi: string;
  amount: number;
  slotId: string;
  winnerRank: number; // 1st, 2nd, etc
  status: 'pending' | 'processing' | 'success' | 'failed' | 'reversed';
  payoutMode: 'upi' | 'bank' | 'wallet';
  razorpayRefId?: string;
  processedBy?: string;
  processedAt?: Date;
  notes?: string;
  retryCount: number;
  failureReason?: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  successRate: number;
  failureRate: number;
  averagePayoutAmount: number;
  profitMargin: number;
  totalWinners: number;
  activeSlots: number;
}

export interface PayoutLog {
  id: string;
  winnerId: string;
  slotId: string;
  amount: number;
  mode: 'upi' | 'bank' | 'wallet';
  status: 'success' | 'failed' | 'pending' | 'reversed';
  adminId: string;
  timestamp: Date;
  razorpayRef?: string;
  notes: string;
  checksum: string; // for audit trail verification
}

export interface Alert {
  id: string;
  type: 'payout_failed' | 'upi_mismatch' | 'revenue_variance' | 'delayed_payout' | 'fraud_detected';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
  action?: string;
}

export interface FinanceInsight {
  message: string;
  metric: string;
  change: number;
  type: 'up' | 'down' | 'neutral';
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  payouts: number;
  profit: number;
  slots: number;
  winners: number;
}

export interface SlotPerformance {
  slotId: string;
  slotTime: string;
  revenue: number;
  payouts: number;
  winners: number;
  participationRate: number;
  profitMargin: number;
}
