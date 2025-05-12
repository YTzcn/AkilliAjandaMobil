import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AuthStore from '../store/AuthStore';
import { getFullUrl } from '../config/api.config';
import axios from 'axios';

class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Android için izin iste
      if (Platform.OS === 'android') {
        await this.requestAndroidPermission();
      }

      // iOS için izin iste
      if (Platform.OS === 'ios') {
        await this.requestIOSPermission();
      }

      // FCM token al
      const token = await this.getFCMToken();
      if (token) {
        await this.updateFCMToken(token);
      }

      // Token yenilendiğinde
      messaging().onTokenRefresh(async (newToken) => {
        console.log('[FirebaseService] FCM token yenilendi');
        await this.updateFCMToken(newToken);
      });

      // Uygulama açıkken bildirim geldiğinde
      messaging().onMessage(async (remoteMessage) => {
        console.log('[FirebaseService] Ön planda bildirim alındı:', remoteMessage);
        this.showNotification(remoteMessage);
      });

      // Uygulama arka plandayken bildirime tıklandığında
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('[FirebaseService] Arka planda bildirime tıklandı:', remoteMessage);
        this.handleNotificationOpen(remoteMessage);
      });

      // Uygulama kapalıyken bildirime tıklanıp açıldığında
      messaging().getInitialNotification().then((remoteMessage) => {
        if (remoteMessage) {
          console.log('[FirebaseService] Kapalıyken bildirime tıklandı:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

      console.log('[FirebaseService] Firebase başarıyla başlatıldı');
    } catch (error) {
      console.error('[FirebaseService] Firebase başlatma hatası:', error);
      throw error;
    }
  }

  private async requestAndroidPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('[FirebaseService] Android izin hatası:', error);
      return false;
    }
  }

  private async requestIOSPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('[FirebaseService] iOS izin hatası:', error);
      return false;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('[FirebaseService] FCM token alındı');
      return token;
    } catch (error) {
      console.error('[FirebaseService] FCM token alma hatası:', error);
      return null;
    }
  }

  private async updateFCMToken(token: string): Promise<void> {
    try {
      const authToken = await AuthStore.getToken();
      if (!authToken) {
        throw new Error('Auth token bulunamadı');
      }

      const response = await axios.post(
        getFullUrl('/api/device/token'),
        {
          device_token: token,
          device_type: Platform.OS
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.message) {
        console.log('[FirebaseService] FCM token başarıyla kaydedildi:', response.data.message);
      }
    } catch (error) {
      console.error('[FirebaseService] FCM token güncelleme hatası:', error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        console.error('Validasyon hatası:', error.response.data?.errors);
      }
      throw error;
    }
  }

  private showNotification(remoteMessage: any): void {
    const title = remoteMessage.notification?.title || 'Yeni Bildirim';
    const body = remoteMessage.notification?.body || '';
    
    Alert.alert(
      title,
      body,
      [{ text: 'Tamam', onPress: () => this.handleNotificationOpen(remoteMessage) }]
    );
  }

  private handleNotificationOpen(remoteMessage: any): void {
    // Bildirim türüne göre yönlendirme yap
    const notificationType = remoteMessage.data?.type;
    const itemId = remoteMessage.data?.id;

    switch (notificationType) {
      case 'event':
        // Event detayına yönlendir
        console.log('[FirebaseService] Event detayına yönlendiriliyor:', itemId);
        break;
      case 'task':
        // Task detayına yönlendir
        console.log('[FirebaseService] Task detayına yönlendiriliyor:', itemId);
        break;
      default:
        console.log('[FirebaseService] Bilinmeyen bildirim türü:', notificationType);
    }
  }
}

export default FirebaseService; 