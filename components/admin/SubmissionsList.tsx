'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SUBMISSIONS_KEY = 'cricket_submissions';

interface Submission {
  id: string;
  type: 'fact' | 'question';
  userId: string;
  userName?: string;
  content?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  status: 'under-verification' | 'approved' | 'rejected';
  createdAt: string;
}

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    const submissionsStr = localStorage.getItem(SUBMISSIONS_KEY);
    const data: Submission[] = submissionsStr ? JSON.parse(submissionsStr) : [];
    setSubmissions(data);
    setLoading(false);
  };

  const updateSubmission = (id: string, newStatus: 'approved' | 'rejected') => {
    const updated = submissions.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    );
    setSubmissions(updated);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  };

  const getFilteredSubmissions = () => {
    if (activeTab === 'pending') return submissions.filter(s => s.status === 'under-verification');
    if (activeTab === 'approved') return submissions.filter(s => s.status === 'approved');
    return submissions.filter(s => s.status === 'rejected');
  };

  const filteredSubmissions = getFilteredSubmissions();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 shadow-lg border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Panel - Submissions</CardTitle>
          <CardDescription>
            Review and approve/reject user submissions (facts & questions)
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({submissions.filter(s => s.status === 'under-verification').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Approved ({submissions.filter(s => s.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            Rejected ({submissions.filter(s => s.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {filteredSubmissions.length === 0 ? (
            <Alert>
              <AlertDescription>No pending submissions to review</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  onApprove={() => updateSubmission(sub.id, 'approved')}
                  onReject={() => updateSubmission(sub.id, 'rejected')}
                  showActions
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          {filteredSubmissions.length === 0 ? (
            <Alert>
              <AlertDescription>No approved submissions</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected">
          {filteredSubmissions.length === 0 ? (
            <Alert>
              <AlertDescription>No rejected submissions</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubmissionCard({
  submission,
  onApprove,
  onReject,
  showActions = false,
}: {
  submission: Submission;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}) {
  const createdDate = new Date(submission.createdAt).toLocaleString();

  const statusColors = {
    'under-verification': 'bg-yellow-50 border-yellow-200',
    'approved': 'bg-green-50 border-green-200',
    'rejected': 'bg-red-50 border-red-200',
  };

  const statusIcons = {
    'under-verification': <Clock className="h-5 w-5 text-yellow-600" />,
    'approved': <CheckCircle className="h-5 w-5 text-green-600" />,
    'rejected': <XCircle className="h-5 w-5 text-red-600" />,
  };

  return (
    <Card className={`border ${statusColors[submission.status]}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {statusIcons[submission.status]}
            <div>
              <p className="font-semibold capitalize">
                {submission.type === 'fact' ? '📝 Fact' : '❓ Question'}
              </p>
              <p className="text-xs text-muted-foreground">{submission.userName}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{createdDate}</span>
        </div>

        {submission.type === 'fact' ? (
          <div className="bg-white p-3 rounded border border-gray-200 mb-3">
            <p className="text-sm">{submission.content}</p>
          </div>
        ) : (
          <div className="bg-white p-3 rounded border border-gray-200 mb-3 space-y-2">
            <p className="font-medium text-sm">{submission.question}</p>
            <div className="space-y-1">
              {submission.options?.map((opt, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded ${
                    opt === submission.correctAnswer
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-gray-100'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                  {opt === submission.correctAnswer && (
                    <span className="ml-2 text-xs font-bold text-green-700">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onApprove}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
