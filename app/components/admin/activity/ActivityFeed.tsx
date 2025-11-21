'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Activity {
  id: string;
  timestamp: Date;
  admin: string;
  action: string;
  details: string;
  icon: string;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="shadow-md border-0 hover:shadow-lg transition">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">
                  <strong>{activity.admin}</strong> {activity.action}
                </p>
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(activity.timestamp, 'MMM dd, HH:mm:ss')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.color}`}>
                {activity.action.toUpperCase().split(' ')[0]}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
