import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarStore from './CalendarStore';
import FirebaseService from '../services/FirebaseService';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

class AuthStore {
  private static readonly TOKEN_KEY = '@auth_token';
  private static readonly USER_KEY = '@auth_user';

  // Token işlemleri
  async setToken(token: string): Promise<void> {
    try {
      console.log('[AuthStore] Token kaydediliyor');
      await AsyncStorage.setItem(AuthStore.TOKEN_KEY, token);
    } catch (error) {
      console.error('[AuthStore] Token kaydetme hatası:', error);
      throw new Error('Token kaydedilemedi');
    }
  }

  async getToken(): Promise<string | null> {
    try {
      console.log('[AuthStore] Token alınıyor');
      return await AsyncStorage.getItem(AuthStore.TOKEN_KEY);
    } catch (error) {
      console.error('[AuthStore] Token alma hatası:', error);
      return null;
    }
  }

  // Kullanıcı bilgileri işlemleri
  async setUser(user: User): Promise<void> {
    try {
      console.log('[AuthStore] Kullanıcı bilgileri kaydediliyor');
      await AsyncStorage.setItem(AuthStore.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[AuthStore] Kullanıcı bilgileri kaydetme hatası:', error);
      throw new Error('Kullanıcı bilgileri kaydedilemedi');
    }
  }

  async getUser(): Promise<User | null> {
    try {
      console.log('[AuthStore] Kullanıcı bilgileri alınıyor');
      const userJson = await AsyncStorage.getItem(AuthStore.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('[AuthStore] Kullanıcı bilgileri alma hatası:', error);
      return null;
    }
  }

  // Auth durumu işlemleri
  async getAuthState(): Promise<AuthState> {
    const [token, user] = await Promise.all([
      this.getToken(),
      this.getUser()
    ]);
    return { token, user };
  }

  async setAuthState(authState: AuthState): Promise<void> {
    try {
      console.log('[AuthStore] Auth durumu kaydediliyor');
      await Promise.all([
        authState.token ? this.setToken(authState.token) : this.clearToken(),
        authState.user ? this.setUser(authState.user) : this.clearUser()
      ]);

      // Login başarılı olduğunda servisleri başlat
      if (authState.token && authState.user) {
        console.log('[AuthStore] Login başarılı, servisler başlatılıyor...');
        
        const [calendarStore, firebaseService] = [
          CalendarStore.getInstance(),
          FirebaseService.getInstance()
        ];

        await Promise.all([
          calendarStore.initialize(),
          firebaseService.initialize()
        ]);
      }
    } catch (error) {
      console.error('[AuthStore] Auth durumu kaydetme hatası:', error);
      throw new Error('Auth durumu kaydedilemedi');
    }
  }

  // Temizleme işlemleri
  async clearToken(): Promise<void> {
    try {
      console.log('[AuthStore] Token siliniyor');
      await AsyncStorage.removeItem(AuthStore.TOKEN_KEY);
    } catch (error) {
      console.error('[AuthStore] Token silme hatası:', error);
    }
  }

  async clearUser(): Promise<void> {
    try {
      console.log('[AuthStore] Kullanıcı bilgileri siliniyor');
      await AsyncStorage.removeItem(AuthStore.USER_KEY);
    } catch (error) {
      console.error('[AuthStore] Kullanıcı bilgileri silme hatası:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      console.log('[AuthStore] Tüm auth bilgileri siliniyor');
      await Promise.all([
        this.clearToken(),
        this.clearUser()
      ]);
    } catch (error) {
      console.error('[AuthStore] Auth bilgileri silme hatası:', error);
    }
  }

  // Auth durumu kontrolü
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthStore(); 