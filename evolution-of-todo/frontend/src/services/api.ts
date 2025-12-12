import axios, { AxiosInstance } from 'axios';
import {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskListResponse,
} from '@/types/task';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  high_priority_pending: number;
  overdue_tasks: number;
  tasks_due_this_week: number;
  most_productive_day: string;
  weekly_completion_rate: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class TaskAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getTasks(
    skip = 0,
    limit = 100,
    filters?: {
      search?: string;
      priority?: string;
      tag?: string;
      is_completed?: boolean;
      sort_by?: 'created_at' | 'due_date' | 'priority';
      sort_order?: 'asc' | 'desc';
    }
  ): Promise<TaskListResponse> {
    const params = {
      skip,
      limit,
      ...filters,
    };
    const { data } = await this.client.get<TaskListResponse>('/tasks', { params });
    return data;
  }

  async getTask(id: number): Promise<Task> {
    const { data } = await this.client.get<Task>(`/tasks/${id}`);
    return data;
  }

  async createTask(task: TaskCreateRequest): Promise<Task> {
    const { data } = await this.client.post<Task>('/tasks', task);
    return data;
  }

  async updateTask(id: number, task: TaskUpdateRequest): Promise<Task> {
    const { data } = await this.client.put<Task>(`/tasks/${id}`, task);
    return data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.client.delete(`/tasks/${id}`);
  }

  async markTaskComplete(id: number): Promise<Task> {
    const { data } = await this.client.patch<Task>(
      `/tasks/${id}/complete`
    );
    return data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await this.client.get<UserProfile>('/auth/me');
    return data;
  }

  async updateProfile(fullName: string): Promise<UserProfile> {
    const { data } = await this.client.put<UserProfile>('/auth/me', {
      full_name: fullName,
    });
    return data;
  }

  async getUserStats(): Promise<UserStats> {
    const { data } = await this.client.get<UserStats>('/auth/me/stats');
    return data;
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post<UserProfile>('/auth/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async deleteAvatar(): Promise<UserProfile> {
    const { data } = await this.client.delete<UserProfile>('/auth/me/avatar');
    return data;
  }

  async getDailyTasks(): Promise<Task[]> {
    const { data } = await this.client.get<Task[]>('/tasks/daily/all');
    return data;
  }
}

export const taskAPI = new TaskAPI();
