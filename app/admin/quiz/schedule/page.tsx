'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const QUIZZES_KEY = 'indcric_quizzes';

export default function ScheduleQuizPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(QUIZZES_KEY);
    if (stored) {
      setQuizzes(JSON.parse(stored));
    }
  }, []);

  const updateSchedule = (id: string, newDate: string) => {
    const updated = quizzes.map(q =>
      q.id === id ? { ...q, scheduledDate: newDate } : q
    );
    setQuizzes(updated);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(updated));
    alert('Quiz schedule updated!');
  };

  return (
    <AdminAuthGuard requiredPermissions={['quiz:schedule']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Schedule Quizzes</h1>
            <p className="text-gray-600 mt-1">Manage quiz schedules</p>
          </div>

          <div className="space-y-3">
            {quizzes.length === 0 ? (
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <p className="text-gray-600">No quizzes found</p>
                </CardContent>
              </Card>
            ) : (
              quizzes.map(quiz => (
                <Card key={quiz.id} className="shadow-lg border-0">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">ID: {quiz.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          quiz.status === 'live' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {quiz.status}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <input
                          type="datetime-local"
                          defaultValue={quiz.scheduledDate}
                          onChange={(e) => updateSchedule(quiz.id, e.target.value)}
                          className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
