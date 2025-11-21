'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

// LocalStorage keys
const SUBMISSIONS_KEY = 'cricket_submissions';
const USER_STATS_KEY = 'user_contribution_stats';

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

interface UserStats {
  factsSubmitted: number;
  questionsSubmitted: number;
}

export default function ContributionPageContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'scorecard' | 'fact' | 'question'>('scorecard');
  const [userStats, setUserStats] = useState<UserStats>({ factsSubmitted: 0, questionsSubmitted: 0 });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = () => {
    // Count only APPROVED submissions
    const submissionsStr = localStorage.getItem(SUBMISSIONS_KEY);
    const submissions: Submission[] = submissionsStr ? JSON.parse(submissionsStr) : [];
    
    const userSubmissions = submissions.filter(s => s.userId === user?.uid && s.status === 'approved');
    
    const stats: UserStats = {
      factsSubmitted: userSubmissions.filter(s => s.type === 'fact').length,
      questionsSubmitted: userSubmissions.filter(s => s.type === 'question').length,
    };
    
    setUserStats(stats);
  };

  const saveSubmission = (submission: Submission) => {
    const existingSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
    const submissions = existingSubmissions ? JSON.parse(existingSubmissions) : [];
    submissions.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user || !profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please log in to contribute</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 shadow-lg border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Contribute & Earn</CardTitle>
          <CardDescription>
            Contribute to the indcric community and earn rewards! Submit facts or questions.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'scorecard' | 'fact' | 'question')} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scorecard">Your Scorecard</TabsTrigger>
          <TabsTrigger value="fact">Add Fact</TabsTrigger>
          <TabsTrigger value="question">Add Question</TabsTrigger>
        </TabsList>

        <TabsContent value="scorecard">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-primary" />
                  Your Contribution Progress
                </CardTitle>
                <CardDescription>
                  Approved submissions only. Submit content to earn a special Gift Voucher!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <span className="font-semibold text-foreground">✅ Facts Approved</span>
                  <span className="text-xl font-bold text-primary">
                    {userStats.factsSubmitted} / 25
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <span className="font-semibold text-foreground">✅ Questions Approved</span>
                  <span className="text-xl font-bold text-primary">
                    {userStats.questionsSubmitted} / 75
                  </span>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Counts increase when admin approves your submissions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="fact">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AddFactForm 
              onSuccess={(submission) => {
                saveSubmission(submission);
                loadUserStats();
                setActiveTab('scorecard');
              }}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="question">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AddQuestionForm 
              onSuccess={(submission) => {
                saveSubmission(submission);
                loadUserStats();
                setActiveTab('scorecard');
              }}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddFactForm({ onSuccess }: { onSuccess: (submission: Submission) => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please enter a fact');
      return;
    }
    if (content.length < 10) {
      alert('Fact must be at least 10 characters');
      return;
    }
    if (content.length > 280) {
      alert('Fact cannot exceed 280 characters');
      return;
    }
    if (!user) {
      alert('Please log in to submit');
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: Submission = {
        id: Date.now().toString(),
        type: 'fact',
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        content: content.trim(),
        status: 'under-verification',
        createdAt: new Date().toISOString(),
      };

      onSuccess(submission);
      alert('✅ Fact submitted successfully! It will appear after admin approval.');
      setContent('');
    } catch (error) {
      console.error('Error submitting fact:', error);
      alert('❌ An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/80 border-0">
      <CardHeader>
        <CardTitle>Submit a Cricket Fact</CardTitle>
        <CardDescription>
          Share an interesting and verifiable cricket fact with the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Fact</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., Sachin Tendulkar is the only player to have scored 100 international centuries."
              rows={4}
              className="w-full p-3 bg-muted text-foreground rounded-lg border border-primary/20 focus:border-primary focus:outline-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length} / 280 characters
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Fact'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddQuestionForm({ onSuccess }: { onSuccess: (submission: Submission) => void }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      alert('Please fill all 4 options');
      return;
    }
    if (!correctAnswer) {
      alert('Please select the correct answer');
      return;
    }
    if (!user) {
      alert('Please log in to submit');
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: Submission = {
        id: Date.now().toString(),
        type: 'question',
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer: correctAnswer,
        status: 'under-verification',
        createdAt: new Date().toISOString(),
      };

      onSuccess(submission);
      alert('✅ Question submitted successfully! It will appear after admin approval.');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('❌ An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/80 border-0">
      <CardHeader>
        <CardTitle>Submit a Question</CardTitle>
        <CardDescription>
          Create a new cricket quiz question for the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your cricket question..."
              rows={3}
              className="w-full p-3 bg-muted text-foreground rounded-lg border border-primary/20 focus:border-primary focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[idx] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="w-full p-2 bg-muted text-foreground rounded-lg border border-primary/20 focus:border-primary focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full p-2 bg-muted text-foreground rounded-lg border border-primary/20 focus:border-primary focus:outline-none"
              disabled={isSubmitting}
            >
              <option value="">Select correct answer...</option>
              {options.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {String.fromCharCode(65 + idx)}. {opt || `Option ${String.fromCharCode(65 + idx)}`}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !question.trim()}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Question'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
