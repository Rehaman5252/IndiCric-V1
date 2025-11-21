'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, AlertCircle, BookOpen, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { submitContribution, getUserApprovedCount } from '@/lib/submission-service';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  factsSubmitted: number;
  questionsSubmitted: number;
}

export default function ContributionPageContent() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'scorecard' | 'fact' | 'question'>('scorecard');
  const [userStats, setUserStats] = useState<UserStats>({ factsSubmitted: 0, questionsSubmitted: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ Load approved counts from Firestore
  useEffect(() => {
    if (user?.uid) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      const factsCount = await getUserApprovedCount(user!.uid, 'fact');
      const questionsCount = await getUserApprovedCount(user!.uid, 'question');
      setUserStats({
        factsSubmitted: factsCount,
        questionsSubmitted: questionsCount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
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
          <CardTitle className="text-2xl">📝 Contribute & Earn</CardTitle>
          <CardDescription>
            Contribute facts or questions to the IndCric community and earn rewards! Submit content that gets approved by admins.
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
          <TabsTrigger value="fact">📚 Add Fact</TabsTrigger>
          <TabsTrigger value="question">❓ Add Question</TabsTrigger>
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
                  Counts update when admins approve your submissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    ✅ Facts Approved
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {userStats.factsSubmitted} / 25
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    ✅ Questions Approved
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {userStats.questionsSubmitted} / 75
                  </span>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your submissions are reviewed by admins. Approved ones appear here!
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
              userId={user.uid}
              userName={user.displayName || profile?.name || 'Anonymous'}
              userEmail={user.email || ''}
              onSuccess={() => {
                toast({
                  title: '✅ Success',
                  description: 'Fact submitted! Admin will review soon.',
                });
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
              userId={user.uid}
              userName={user.displayName || profile?.name || 'Anonymous'}
              userEmail={user.email || ''}
              onSuccess={() => {
                toast({
                  title: '✅ Success',
                  description: 'Question submitted! Admin will review soon.',
                });
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

// ✅ ADD FACT FORM - Now uses Firestore
function AddFactForm({
  userId,
  userName,
  userEmail,
  onSuccess,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}) {
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
    if (content.length > 500) {
      alert('Fact cannot exceed 500 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Submit to Firestore
      await submitContribution(userId, userName, userEmail, 'fact', {
        content: content.trim(),
      });

      onSuccess();
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
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="text-primary" />
          Submit a Cricket Fact
        </CardTitle>
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
              rows={5}
              className="w-full p-3 bg-muted text-foreground rounded-lg border border-primary/20 focus:border-primary focus:outline-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length} / 500 characters
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-semibold"
          >
            {isSubmitting ? '⏳ Submitting...' : '📤 Submit Fact'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

// ✅ ADD QUESTION FORM - Now uses Firestore
function AddQuestionForm({
  userId,
  userName,
  userEmail,
  onSuccess,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}) {
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

    setIsSubmitting(true);

    try {
      // ✅ Submit to Firestore
      await submitContribution(userId, userName, userEmail, 'question', {
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer: correctAnswer,
      });

      onSuccess();
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
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="text-primary" />
          Submit a Question
        </CardTitle>
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
            <label className="block text-sm font-medium mb-2">Options (A, B, C, D)</label>
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
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-semibold"
          >
            {isSubmitting ? '⏳ Submitting...' : '📤 Submit Question'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
