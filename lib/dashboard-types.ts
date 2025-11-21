export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  growth: number; // percentage
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  description?: string;
}

export interface ChartData {
  date: string;
  users: number;
  active: number;
  engaged: number;
  revenue: number;
}

export interface ActivityFeed {
  id: string;
  type: 'user' | 'admin' | 'system' | 'ad' | 'quiz';
  message: string;
  timestamp: string;
  user: string;
  icon: string;
  color: string;
}

export interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  path?: string;
  onClick?: () => void;
}

export interface AdminActivity {
  id: string;
  admin: string;
  action: string;
  timestamp: string;
  status: 'success' | 'reverted' | 'pending';
  ip?: string;
}
