'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', completed: 120, pending: 45, failed: 12 },
  { day: 'Tue', completed: 180, pending: 60, failed: 15 },
  { day: 'Wed', completed: 150, pending: 50, failed: 10 },
  { day: 'Thu', completed: 200, pending: 70, failed: 18 },
  { day: 'Fri', completed: 220, pending: 80, failed: 20 },
  { day: 'Sat', completed: 250, pending: 90, failed: 22 },
  { day: 'Sun', completed: 180, pending: 55, failed: 14 },
];

export default function QuizStatsChart() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>❓ Quiz Participation (This Week)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#16a34a" name="Completed" />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
