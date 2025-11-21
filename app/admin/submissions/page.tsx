'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';
import {
  subscribeToSubmissionMetrics,
  getPendingSubmissions,
  getApprovedSubmissions,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
  type Submission,
  type SubmissionMetrics,
} from '@/lib/submission-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, HelpCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'pending-facts' | 'pending-questions' | 'approved-facts' | 'approved-questions';

export default function SubmissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [metrics, setMetrics] = useState<SubmissionMetrics>({
    total: 0,
    pending: 0,
    approved: 0,
    facts: 0,
    questions: 0,
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check admin session
  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
  }, [router]);

  // Real-time metrics subscription
  useEffect(() => {
    if (!session) return;
    const unsubscribe = subscribeToSubmissionMetrics(setMetrics);
    return () => unsubscribe();
  }, [session]);

  // Load submissions based on filter
  useEffect(() => {
    if (!session) return;
    loadSubmissionsByFilter(activeFilter);
  }, [session, activeFilter]);

  const loadSubmissionsByFilter = async (filter: FilterType) => {
    try {
      setLoading(true);
      let data: Submission[] = [];

      if (filter === 'all') {
        data = await getAllSubmissions();
      } else if (filter === 'pending-facts') {
        const pending = await getPendingSubmissions();
        data = pending.filter(s => s.type === 'fact');
      } else if (filter === 'pending-questions') {
        const pending = await getPendingSubmissions();
        data = pending.filter(s => s.type === 'question');
      } else if (filter === 'approved-facts') {
        const approved = await getApprovedSubmissions();
        data = approved.filter(s => s.type === 'fact');
      } else if (filter === 'approved-questions') {
        const approved = await getApprovedSubmissions();
        data = approved.filter(s => s.type === 'question');
      }

      setSubmissions(data);
      setAllSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      setProcessingId(submissionId);
      await approveSubmission(submissionId, session.uid);
      
      toast({
        title: '✅ Approved',
        description: 'Submission approved successfully!',
      });

      await loadSubmissionsByFilter(activeFilter);
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve submission',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!confirm('Are you sure you want to reject this submission?')) return;

    try {
      setProcessingId(submissionId);
      await rejectSubmission(submissionId);
      
      toast({
        title: '❌ Rejected',
        description: 'Submission rejected.',
      });

      await loadSubmissionsByFilter(activeFilter);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject submission',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">📋 Submissions Management</h1>
        <p className="text-muted-foreground">Review and approve user contributions</p>
      </div>

      {/* ===== 5 FILTER BUTTONS ===== */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Filter by:</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* Total */}
          <Button
            onClick={() => setActiveFilter('all')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200'
            }`}
          >
            📦 Total ({metrics.total})
          </Button>

          {/* Pending Facts */}
          <Button
            onClick={() => setActiveFilter('pending-facts')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeFilter === 'pending-facts'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200'
            }`}
          >
            ⏳ Pending Facts
          </Button>

          {/* Pending Questions */}
          <Button
            onClick={() => setActiveFilter('pending-questions')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeFilter === 'pending-questions'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200'
            }`}
          >
            ⏳ Pending Q&A
          </Button>

          {/* Approved Facts */}
          <Button
            onClick={() => setActiveFilter('approved-facts')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeFilter === 'approved-facts'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600/30 hover:bg-green-600/50 text-green-200'
            }`}
          >
            ✅ Approved Facts
          </Button>

          {/* Approved Questions */}
          <Button
            onClick={() => setActiveFilter('approved-questions')}
            className={`py-2 px-3 rounded-lg font-semibold transition ${
              activeFilter === 'approved-questions'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200'
            }`}
          >
            ✅ Approved Q&A
          </Button>
        </div>
      </div>

      {/* Submissions List */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">
            📝 {activeFilter === 'all' ? 'All' : activeFilter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">🎉 No submissions in this category!</p>
              <p className="text-xs text-muted-foreground">Try a different filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-muted/50 border border-gray-700 rounded-lg p-4 hover:bg-muted/80 transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
                        {submission.type === 'fact' ? (
                          <BookOpen className="h-4 w-4 text-green-400" />
                        ) : (
                          <HelpCircle className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-xs font-semibold uppercase">
                          {submission.type === 'fact' ? '📚 Fact' : '❓ Question'}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        submission.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                        submission.status === 'approved' ? 'bg-green-500/30 text-green-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {submission.status.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(submission.createdAt.seconds * 1000).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="mb-3 text-sm">
                    <p className="font-semibold text-white">{submission.userName}</p>
                    <p className="text-xs text-muted-foreground">{submission.userEmail}</p>
                  </div>

                  {/* Content */}
                  {submission.type === 'fact' && submission.content && (
                    <div className="bg-background/50 p-3 rounded mb-4">
                      <p className="text-sm text-foreground">{submission.content}</p>
                    </div>
                  )}

                  {submission.type === 'question' && submission.question && (
                    <div className="bg-background/50 p-3 rounded mb-4">
                      <p className="font-semibold text-sm text-foreground mb-2">
                        Q: {submission.question}
                      </p>
                      <div className="space-y-1">
                        {submission.options?.map((option, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-2 rounded ${
                              option === submission.correctAnswer
                                ? 'bg-green-500/20 text-green-400'
                                : 'text-gray-400'
                            }`}
                          >
                            <span className="font-semibold">
                              {String.fromCharCode(65 + idx)}.
                            </span>{' '}
                            {option}
                            {option === submission.correctAnswer && ' ✅'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Only show for pending */}
                  {submission.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(submission.id)}
                        disabled={processingId === submission.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(submission.id)}
                        disabled={processingId === submission.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processingId === submission.id ? 'Processing...' : 'Approve'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-gray-500 text-xs py-4 border-t border-gray-800">
        <p>Submissions Management | Real-time Updates ✅</p>
      </div>
    </div>
  );
}
  