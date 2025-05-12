import axios from 'axios';
import { BASE_URL } from '../config/api.config';
import AuthStore from '../store/AuthStore';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 1 | 2 | 3; // 1: Düşük, 2: Orta, 3: Yüksek
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date: string;
  priority?: 1 | 2 | 3;
  status?: 'pending' | 'in-progress' | 'completed';
  is_completed?: boolean;
  category_ids?: number[];
}

class TaskService {
  private static instance: TaskService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${BASE_URL}/api/tasks`;
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private async getHeaders() {
    const token = await AuthStore.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public async getTasks(startDate?: string, endDate?: string): Promise<Task[]> {
    try {
      const headers = await this.getHeaders();
      const params = { start: startDate, end: endDate };
      const response = await axios.get(this.baseUrl, { headers, params });
      return response.data;
    } catch (error) {
      console.error('Görevler getirilirken hata:', error);
      throw error;
    }
  }

  public async getTask(taskId: number): Promise<Task> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/${taskId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Görev detayı getirilirken hata:', error);
      throw error;
    }
  }

  public async createTask(task: CreateTaskRequest): Promise<Task> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(this.baseUrl, task, { headers });
      return response.data.task;
    } catch (error) {
      console.error('Görev oluşturulurken hata:', error);
      throw error;
    }
  }

  public async updateTask(taskId: number, task: CreateTaskRequest): Promise<Task> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.baseUrl}/${taskId}`, task, { headers });
      return response.data.task;
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      throw error;
    }
  }

  public async deleteTask(taskId: number): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${this.baseUrl}/${taskId}`, { headers });
    } catch (error) {
      console.error('Görev silinirken hata:', error);
      throw error;
    }
  }

  // Görev durumunu güncelle (tamamlandı/tamamlanmadı)
  public async toggleTaskCompletion(taskId: number, isCompleted: boolean): Promise<Task> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.baseUrl}/${taskId}`, {
        is_completed: isCompleted,
        status: isCompleted ? 'completed' : 'pending'
      }, { headers });
      return response.data.task;
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      throw error;
    }
  }

  // Görev önceliğini güncelle
  public async updateTaskPriority(taskId: number, priority: 1 | 2 | 3): Promise<Task> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.baseUrl}/${taskId}`, {
        priority
      }, { headers });
      return response.data.task;
    } catch (error) {
      console.error('Görev önceliği güncellenirken hata:', error);
      throw error;
    }
  }
}

export default TaskService; 