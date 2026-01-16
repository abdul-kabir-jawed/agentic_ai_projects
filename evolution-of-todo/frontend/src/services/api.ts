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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';
const API_URL = `${API_BASE}${API_BASE_PATH}`;

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

    // Normalize response: convert 'tasks' to 'items' if needed
    if (data.tasks && !data.items) {
      return {
        ...data,
        items: data.tasks,
      };
    }

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
    // Compress and resize image before uploading
    const compressedBase64 = await this.compressImage(file, 200, 0.8);

    const { data } = await this.client.post<UserProfile>('/auth/me/avatar', {
      image_data: compressedBase64,
    });
    return data;
  }

  private async compressImage(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 200x200 for avatar)
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
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
