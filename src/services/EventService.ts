import axios from 'axios';
import { BASE_URL } from '../config/api.config';
import AuthStore from '../store/AuthStore';
import moment from 'moment';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  location?: string;
}

class EventService {
  private static instance: EventService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${BASE_URL}/api/events`;
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private async getHeaders() {
    const token = await AuthStore.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private formatDateForAPI(date: string | Date): string {
    return moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  }

  public async getEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      const headers = await this.getHeaders();
      const params = { start: startDate, end: endDate };
      const response = await axios.get(this.baseUrl, { headers, params });
      return response.data;
    } catch (error) {
      console.error('Etkinlikler getirilirken hata:', error);
      throw error;
    }
  }

  public async getEvent(eventId: number): Promise<CalendarEvent> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/${eventId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Etkinlik detayı getirilirken hata:', error);
      throw error;
    }
  }

  public async createEvent(event: CreateEventRequest): Promise<CalendarEvent> {
    try {
      const headers = await this.getHeaders();
      const formattedEvent = {
        ...event,
        start_date: this.formatDateForAPI(event.start_date),
        end_date: this.formatDateForAPI(event.end_date),
        all_day: event.all_day || false
      };
      const response = await axios.post(this.baseUrl, formattedEvent, { headers });
      return response.data.event;
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        throw new Error(`Validasyon hatası: ${JSON.stringify(validationErrors)}`);
      }
      throw error;
    }
  }

  public async updateEvent(eventId: number, event: CreateEventRequest): Promise<CalendarEvent> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.baseUrl}/${eventId}`, event, { headers });
      return response.data.event;
    } catch (error) {
      console.error('Etkinlik güncellenirken hata:', error);
      throw error;
    }
  }

  public async deleteEvent(eventId: number): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${this.baseUrl}/${eventId}`, { headers });
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
      throw error;
    }
  }
}

export default EventService; 