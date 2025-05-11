import axios from 'axios';
import { BASE_URL } from '../config/api.config';
import AuthStore from '../store/AuthStore';

class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${BASE_URL}/api/google`;
  }

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  private async getHeaders(): Promise<{ [key: string]: string }> {
    const token = await AuthStore.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Google Calendar bağlantı durumunu kontrol et
  public async checkConnectionStatus(): Promise<boolean> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/connection-status`, { headers });
      return response.data.connected;
    } catch (error) {
      console.error('Google bağlantı durumu kontrolü hatası:', error);
      return false;
    }
  }

  // Google yetkilendirme URL'sini al
  public async getAuthUrl(): Promise<string> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/auth-url`, { headers });
      return response.data.auth_url;
    } catch (error) {
      console.error('Google yetkilendirme URL hatası:', error);
      throw error;
    }
  }

  // Google yetkilendirme kodunu backend'e gönder
  public async handleAuthCode(code: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.post(`${this.baseUrl}/callback`, { code }, { headers });
    } catch (error) {
      console.error('Google yetkilendirme kodu hatası:', error);
      throw error;
    }
  }

  // Google bağlantısını kaldır
  public async disconnect(): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.post(`${this.baseUrl}/disconnect`, {}, { headers });
    } catch (error) {
      console.error('Google bağlantısı kaldırma hatası:', error);
      throw error;
    }
  }

  // Google Takvim etkinliklerini getir
  public async getEvents(startDate: string, endDate: string): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/events`, {
        headers,
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data.events;
    } catch (error) {
      console.error('Google etkinlikleri getirme hatası:', error);
      throw error;
    }
  }

  // Google Takvim'den etkinlikleri içe aktar
  public async importEvents(startDate: string, endDate: string): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.baseUrl}/import-events`, {
        start_date: startDate,
        end_date: endDate
      }, { headers });
      return response.data;
    } catch (error) {
      console.error('Google etkinlikleri içe aktarma hatası:', error);
      throw error;
    }
  }

  // Belirli bir etkinliği Google Takvim ile senkronize et
  public async syncEvent(eventId: number): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.post(`${this.baseUrl}/sync-event`, { event_id: eventId }, { headers });
    } catch (error) {
      console.error('Etkinlik senkronizasyon hatası:', error);
      throw error;
    }
  }

  // Tüm etkinlikleri Google Takvim ile senkronize et
  public async syncAllEvents(): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.baseUrl}/sync-all-events`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Tüm etkinlikleri senkronize etme hatası:', error);
      throw error;
    }
  }

  // Görevleri Google Tasks ile senkronize et
  public async syncTasks(): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.baseUrl}/sync-tasks`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Görev senkronizasyon hatası:', error);
      throw error;
    }
  }
}

export default GoogleCalendarService; 