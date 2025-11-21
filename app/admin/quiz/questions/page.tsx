'use client';
import AdminAuthGuard from '@/app/components/admin/AdminAuthGuard';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const QUIZZES_KEY = 'indcric_quizzes';

export default function QuestionsPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(QUIZZES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuizzes(parsed);
      if (parsed.length > 0) {
        setSelectedQuiz(parsed[0].id);
      }
    }
  }, []);

  const addQuestion = () => {
    if (!formData.text || !selectedQuiz) {
      alert('Please fill all fields');
      return;
    }

    const updated = quizzes.map(q =>
      q.id === selectedQuiz
        ? {
            ...q,
            questions: [
              ...q.questions,
              {
                id: Date.now().toString(),
                text: formData.text,
                options: formData.options.filter(o => o.trim()),
                correctAnswer: formData.correctAnswer,
                explanation: formData.explanation,
              },
            ],
            totalQuestions: q.questions.length + 1,
          }
        : q
    );

    setQuizzes(updated);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(updated));
    alert('Question added successfully!');
    setFormData({ text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    setShowForm(false);
  };

  const currentQuiz = quizzes.find(q => q.id === selectedQuiz);

  return (
    <AdminAuthGuard requiredPermissions={['questions:manage']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Questions Bank</h1>
            <p className="text-gray-600 mt-1">Manage quiz questions</p>
          </div>

          {/* Quiz Selector */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Select Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.totalQuestions} questions)
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Add Question Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>

          {/* Add Question Form */}
          {showForm && (
            <Card className="bg-green-50 border-green-200 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter question"
                    rows={3}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  <div className="space-y-2">
                    {formData.options.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Correct Answer</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Select correct answer</option>
                    {formData.options.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {String.fromCharCode(65 + idx)}. {opt || `Option ${String.fromCharCode(65 + idx)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Explanation</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explain the correct answer"
                    rows={2}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  onClick={addQuestion}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition"
                >
                  Add Question
                </button>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          {currentQuiz && currentQuiz.questions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Questions in {currentQuiz.title}</h2>
              {currentQuiz.questions.map((q: any, idx: number) => (
                <Card key={q.id} className="shadow-lg border-0">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="font-bold">{idx + 1}. {q.text}</p>
                      <div className="space-y-1 ml-4">
                        {q.options.map((opt: string, optIdx: number) => (
                          <p key={optIdx} className={`text-sm ${opt === q.correctAnswer ? 'text-green-700 font-bold' : ''}`}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </p>
                        ))}
                      </div>
                      {q.explanation && <p className="text-sm text-gray-600 mt-2"><strong>Explanation:</strong> {q.explanation}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
