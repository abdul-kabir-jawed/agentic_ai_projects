export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  description: string;
  is_completed: boolean;
  priority: Priority;
  tags?: string;
  due_date?: string;
  is_daily?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  description: string;
  priority?: Priority;
  tags?: string;
  due_date?: string;
  is_daily?: boolean;
}

export interface TaskUpdateRequest {
  description?: string;
  priority?: Priority;
  tags?: string;
  due_date?: string;
  is_completed?: boolean;
  is_daily?: boolean;
}

export interface TaskListResponse {
  items?: Task[];
  tasks?: Task[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}
