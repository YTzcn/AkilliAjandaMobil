import {
  Pusher,
  PusherMember,
  PusherChannel,
  PusherEvent,
} from '@pusher/pusher-websocket-react-native';
import AuthStore from '../store/AuthStore';

class PusherService {
  private static instance: PusherService;
  private pusher: Pusher;
  private channel: PusherChannel | null = null;

  private constructor() {
    this.pusher = Pusher.getInstance();
  }

  public static getInstance(): PusherService {
    if (!PusherService.instance) {
      PusherService.instance = new PusherService();
    }
    return PusherService.instance;
  }

  public async initialize() {
    try {
      console.log('[PusherService] Pusher başlatılıyor...');

      await this.pusher.init({
        apiKey: "2d998dd8b8d2cec5208d",
        cluster: "ap2",
        useTLS: true // Güvenli bağlantı için
      });
      
      await this.pusher.connect();
      console.log('[PusherService] Bağlantı durumu:', this.pusher.connectionState);
      
      console.log('[PusherService] Bağlantı başarılı');
    } catch (error) {
      console.error('[PusherService] Bağlantı hatası:', error);
      throw error;
    }
  }

  public async subscribeToCalendarUpdates(onUpdate: () => void) {
    try {
      const user = await AuthStore.getUser();
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const channelName = `calendar-${user.id}`;
      console.log('[PusherService] Kanala abone olunuyor:', channelName);

      // Önce eski aboneliği temizle
      if (this.channel) {
        console.log('[PusherService] Eski kanal aboneliği temizleniyor...');
        await this.pusher.unsubscribe({ channelName: this.channel.channelName });
      }
      
      this.channel = await this.pusher.subscribe({
        channelName,
        onEvent: (event: PusherEvent) => {
          console.log('[PusherService] Event alındı:', {
            kanal: event.channelName,
            event: event.eventName,
            data: event.data
          });
          
          if (event.eventName === 'calendar-update') {
            console.log('[PusherService] Takvim güncellemesi tetikleniyor...');
            onUpdate();
          }
        },
        onSubscriptionSucceeded: (data: any) => {
          console.log('[PusherService] Kanal aboneliği başarılı:', {
            kanal: channelName,
            data
          });
        },
        onSubscriptionError: (error: any) => {
          console.error('[PusherService] Kanal aboneliği hatası:', {
            kanal: channelName,
            hata: error
          });
        }
      });

    } catch (error) {
      console.error('[PusherService] Kanal aboneliği hatası:', error);
      throw error; // Hatayı yukarı fırlat
    }
  }

  public async disconnect() {
    try {
      if (this.channel) {
        console.log('[PusherService] Kanal aboneliği kapatılıyor:', this.channel.channelName);
        await this.pusher.unsubscribe({ channelName: this.channel.channelName });
      }
      console.log('[PusherService] Pusher bağlantısı kapatılıyor...');
      await this.pusher.disconnect();
      console.log('[PusherService] Bağlantı kapatıldı');
    } catch (error) {
      console.error('[PusherService] Bağlantı kapatma hatası:', error);
      throw error;
    }
  }
}

export default PusherService; 