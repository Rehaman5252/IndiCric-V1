'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { week: 'Week 1', payouts: 5000, adRevenue: 2000 },
  { week: 'Week 2', payouts: 7500, adRevenue: 3000 },
  { week: 'Week 3', payouts: 6800, adRevenue: 2800 },
  { week: 'Week 4', payouts: 9200, adRevenue: 4000 },
];

export default function RevenueChart() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>💰 Revenue Trends (Last 4 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="payouts" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              dot={{ r: 6 }}
              name="Payouts"
            />
            <Line 
              type="monotone" 
              dataKey="adRevenue" 
              stroke="#ec4899" 
              strokeWidth={2} 
              dot={{ r: 6 }}
              name="Ad Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
