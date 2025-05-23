import { makeAutoObservable, runInAction } from 'mobx';
import EventService, { CalendarEvent, CreateEventRequest } from '../services/EventService';
import TaskService, { Task, CreateTaskRequest } from '../services/TaskService';
import PusherService from '../services/PusherService';

class CalendarStore {
  private static instance: CalendarStore;
  private pusherService: PusherService;
  
  events: CalendarEvent[] = [];
  tasks: Task[] = [];
  loading = false;
  error: string | null = null;

  private constructor() {
    makeAutoObservable(this);
    this.pusherService = PusherService.getInstance();
  }

  public static getInstance(): CalendarStore {
    if (!CalendarStore.instance) {
      CalendarStore.instance = new CalendarStore();
    }
    return CalendarStore.instance;
  }

  async initialize() {
    const maxRetries = 3;
    let retryCount = 0;

    const initializePusher = async () => {
      try {
        await this.pusherService.initialize();
        await this.pusherService.subscribeToCalendarUpdates(async () => {
          console.log('[CalendarStore] Takvim güncellemesi alındı, veriler yenileniyor...');
          await this.fetchEvents();
          await this.fetchTasks();
        });
      } catch (error) {
        console.error(`[CalendarStore] Pusher başlatma hatası (Deneme ${retryCount + 1}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[CalendarStore] Yeniden deneniyor (${retryCount}/${maxRetries})...`);
          // 2 saniye bekle ve tekrar dene
          await new Promise(resolve => setTimeout(resolve, 2000));
          await initializePusher();
        } else {
          console.error('[CalendarStore] Maksimum deneme sayısına ulaşıldı. Pusher başlatılamadı.');
        }
      }
    };

    await initializePusher();
  }

  async cleanup() {
    await this.pusherService.disconnect();
  }

  // Etkinlik İşlemleri
  async fetchEvents(startDate?: string, endDate?: string) {
    this.loading = true;
    this.error = null;
    try {
      const eventService = EventService.getInstance();
      const events = await eventService.getEvents(startDate, endDate);
      runInAction(() => {
        this.events = events;
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  async createEvent(event: CreateEventRequest) {
    this.loading = true;
    this.error = null;
    try {
      const eventService = EventService.getInstance();
      const newEvent = await eventService.createEvent(event);
      runInAction(() => {
        this.events.push(newEvent);
        this.loading = false;
      });
      return newEvent;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async updateEvent(eventId: number, event: CreateEventRequest) {
    this.loading = true;
    this.error = null;
    try {
      const eventService = EventService.getInstance();
      const updatedEvent = await eventService.updateEvent(eventId, event);
      runInAction(() => {
        const index = this.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }
        this.loading = false;
      });
      return updatedEvent;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteEvent(eventId: number) {
    this.loading = true;
    this.error = null;
    try {
      const eventService = EventService.getInstance();
      await eventService.deleteEvent(eventId);
      runInAction(() => {
        this.events = this.events.filter(e => e.id !== eventId);
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Görev İşlemleri
  async fetchTasks(startDate?: string, endDate?: string) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      const tasks = await taskService.getTasks(startDate, endDate);
      runInAction(() => {
        this.tasks = tasks;
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  async createTask(task: CreateTaskRequest) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      const newTask = await taskService.createTask(task);
      runInAction(() => {
        this.tasks.push(newTask);
        this.loading = false;
      });
      return newTask;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async updateTask(taskId: number, task: CreateTaskRequest) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      const updatedTask = await taskService.updateTask(taskId, task);
      runInAction(() => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.loading = false;
      });
      return updatedTask;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteTask(taskId: number) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      await taskService.deleteTask(taskId);
      runInAction(() => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async toggleTaskCompletion(taskId: number, isCompleted: boolean) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      const updatedTask = await taskService.toggleTaskCompletion(taskId, isCompleted);
      runInAction(() => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.loading = false;
      });
      return updatedTask;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  async updateTaskPriority(taskId: number, priority: 1 | 2 | 3) {
    this.loading = true;
    this.error = null;
    try {
      const taskService = TaskService.getInstance();
      const updatedTask = await taskService.updateTaskPriority(taskId, priority);
      runInAction(() => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.loading = false;
      });
      return updatedTask;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Store Temizleme
  clearStore() {
    this.events = [];
    this.tasks = [];
    this.loading = false;
    this.error = null;
  }
}

export default CalendarStore; 