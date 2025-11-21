'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', users: 400, activeUsers: 240 },
  { month: 'Feb', users: 520, activeUsers: 340 },
  { month: 'Mar', users: 680, activeUsers: 450 },
  { month: 'Apr', users: 850, activeUsers: 620 },
  { month: 'May', users: 1050, activeUsers: 820 },
  { month: 'Jun', users: 1240, activeUsers: 950 },
];

export default function UserGrowthChart() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>📈 User Growth (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#16a34a" 
              strokeWidth={2} 
              dot={{ r: 6 }}
              name="Total Users"
            />
            <Line 
              type="monotone" 
              dataKey="activeUsers" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 6 }}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
