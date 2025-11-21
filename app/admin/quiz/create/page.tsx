'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const QUIZZES_KEY = 'indcric_quizzes';

export default function CreateQuizPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 15,
    scheduledDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduledDate) {
      alert('Please fill all required fields');
      return;
    }

    const newQuiz = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      totalQuestions: 0,
      duration: formData.duration,
      status: 'scheduled',
      scheduledDate: formData.scheduledDate,
      createdAt: new Date().toISOString(),
      questions: [],
    };

    const stored = localStorage.getItem(QUIZZES_KEY);
    const quizzes = stored ? JSON.parse(stored) : [];
    quizzes.push(newQuiz);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));

    alert('Quiz created successfully!');
    setFormData({ title: '', description: '', duration: 15, scheduledDate: '' });
  };

  return (
    <AdminAuthGuard requiredPermissions={['quiz:create']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create New Quiz</h1>
            <p className="text-gray-600 mt-1">Create and configure a new quiz</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quiz Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., IPL 2024 Trivia"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description about the quiz"
                    rows={4}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Scheduled Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition font-medium"
                >
                  Create Quiz
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
