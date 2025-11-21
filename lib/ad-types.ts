export interface Ad {
  id: string;
  companyName: string;
  redirectUrl: string;
  adType: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  slot: 'Q1-Q2' | 'Q2-Q3' | 'Q3-Q4' | 'Q4-Q5' | 'after-quiz' | 'cube-face-1' | 'cube-face-2' | 'cube-face-3' | 'cube-face-4' | 'cube-face-5' | 'cube-face-6';
  revenue: number;
  createdAt: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
}

export interface AdView {
  id: string;
  adId: string;
  userId?: string; // Optional, from user session
  timestamp: string;
  userAgent: string;
  ipAddress?: string;
  quizSlot?: string;
  duration?: number; // milliseconds ad was visible
}

export interface AdClick {
  id: string;
  adId: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  ipAddress?: string;
}
