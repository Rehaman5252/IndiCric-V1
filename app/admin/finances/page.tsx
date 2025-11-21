'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  XCircle,
  Check,
  X,
  Download,
  AlertTriangle,
} from 'lucide-react';
import {
  getAllPaymentRequests,
  getPaymentStats,
  markPaymentCompleted,
  markPaymentFailed,
} from '@/lib/payment-service';
import { PaymentRequest, PaymentStats } from '@/types/payment';
import { toast } from 'sonner';

type ViewMode = 'none' | 'total' | 'pending' | 'completed' | 'failed';

export default function FinancesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('none');
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
  });
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
    loadPayments();
  }, [router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [allPayments, paymentStats] = await Promise.all([
        getAllPaymentRequests(),
        getPaymentStats(),
      ]);
      setPayments(allPayments);
      setFilteredPayments(allPayments);
      setStats(paymentStats);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = payments;

    switch (viewMode) {
      case 'pending':
        filtered = payments.filter((p) => p.status === 'pending');
        break;
      case 'completed':
        filtered = payments.filter((p) => p.status === 'completed');
        break;
      case 'failed':
        filtered = payments.filter((p) => p.status === 'failed');
        break;
      default:
        filtered = payments;
    }

    setFilteredPayments(filtered);
  }, [viewMode, payments]);

  const handleMarkCompleted = async (paymentId: string) => {
    if (!session?.email) {
      toast.error('Admin session not found');
      return;
    }

    if (!confirm('Are you sure you have sent the payment to this user?')) return;

    try {
      setProcessing(paymentId);
      await markPaymentCompleted(paymentId, session.email);
      toast.success('Payment marked as completed!');
      loadPayments();
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error('Failed to mark payment as completed');
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkFailed = async (paymentId: string) => {
    if (!session?.email) {
      toast.error('Admin session not found');
      return;
    }

    const reason = prompt('Please provide a reason for failure:');
    if (!reason) return;

    try {
      setProcessing(paymentId);
      await markPaymentFailed(paymentId, session.email, reason);
      toast.success('Payment marked as failed');
      loadPayments();
    } catch (error) {
      console.error('Error marking payment as failed:', error);
      toast.error('Failed to mark payment as failed');
    } finally {
      setProcessing(null);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['User Name', 'UPI ID', 'Phone', 'Amount', 'Status', 'Created At', 'Completed At', 'Completed By'],
      ...filteredPayments.map((p) => [
        p.userName,
        p.userUpi,
        p.userPhone,
        `₹${p.amount}`,
        p.status,
        p.createdAt.toDate().toLocaleString(),
        p.completedAt ? p.completedAt.toDate().toLocaleString() : '-',
        p.completedBy || '-',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully!');
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">💰 Finances & Payouts</h1>
          <p className="text-gray-400 mt-2">Real-time payment management for quiz winners</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards - CLICKABLE */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className={`cursor-pointer transition-all hover:scale-105 ${
            viewMode === 'total' ? 'ring-2 ring-blue-500' : ''
          } bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800`}
          onClick={() => setViewMode(viewMode === 'total' ? 'none' : 'total')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">🎯 Total Payments</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">₹{stats.totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-105 ${
            viewMode === 'pending' ? 'ring-2 ring-yellow-500' : ''
          } bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800`}
          onClick={() => setViewMode(viewMode === 'pending' ? 'none' : 'pending')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">⏳ Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">₹{stats.pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-105 ${
            viewMode === 'completed' ? 'ring-2 ring-green-500' : ''
          } bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800`}
          onClick={() => setViewMode(viewMode === 'completed' ? 'none' : 'completed')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">✅ Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">₹{stats.completedAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-105 ${
            viewMode === 'failed' ? 'ring-2 ring-red-500' : ''
          } bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800`}
          onClick={() => setViewMode(viewMode === 'failed' ? 'none' : 'failed')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">❌ Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.failedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Click to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {viewMode === 'total' && '📋 All Payment Requests'}
              {viewMode === 'pending' && '⏳ Pending Payouts'}
              {viewMode === 'completed' && '✅ Completed Payments'}
              {viewMode === 'failed' && '❌ Failed Payments'}
              {viewMode === 'none' && '📋 All Payment Requests'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Showing {filteredPayments.length} payments</p>
          </div>
          {viewMode !== 'none' && (
            <Button variant="outline" onClick={() => setViewMode('none')} className="text-sm">
              Clear Filter
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>UPI ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.userName}</TableCell>
                      <TableCell className="font-mono text-xs">{payment.userUpi || 'Not Provided'}</TableCell>
                      <TableCell>{payment.userPhone}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{payment.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'default'
                              : payment.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {payment.status === 'completed' && '✅ '}
                          {payment.status === 'pending' && '⏳ '}
                          {payment.status === 'failed' && '❌ '}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {payment.createdAt.toDate().toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkCompleted(payment.id)}
                              disabled={processing === payment.id}
                              title="Mark as Paid"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleMarkFailed(payment.id)}
                              disabled={processing === payment.id}
                              title="Mark as Failed"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {payment.status === 'completed' && (
                          <span className="text-xs text-muted-foreground">Paid by {payment.completedBy}</span>
                        )}
                        {payment.status === 'failed' && (
                          <span className="text-xs text-red-600">{payment.failureReason}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
