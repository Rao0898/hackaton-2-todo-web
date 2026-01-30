export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  due_date?: string; // ISO 8601 datetime string
  recurrence_pattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    end_date?: string; // ISO 8601 datetime string
  } | null;
  completed: boolean;
  completed_at?: string; // ISO 8601 datetime string
  user_id: string;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  next_occurrence?: string; // ISO 8601 datetime string (for recurring tasks)
}