import axios from 'axios';
import { AUTH_ENDPOINTS, getFullUrl } from '../config/api.config';
import { checkInternetConnection, handleApiError } from '../utils/NetworkUtils';
import AuthStore, { User } from '../store/AuthStore';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string; // Genellikle backend email değişimini farklı bir akışla yönetir
}

class AuthService {
  // Kayıt işlemi
  async register(data: RegisterData) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.REGISTER), data);
      
      if (response.data.token && response.data.user) {
        await AuthStore.setAuthState({
          token: response.data.token,
          user: response.data.user
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Giriş işlemi
  async login(data: LoginData) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.LOGIN), data);
      
      if (response.data.token && response.data.user) {
        await AuthStore.setAuthState({
          token: response.data.token,
          user: response.data.user
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // E-posta doğrulama
  async verifyEmail(data: VerifyEmailData) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.VERIFY_EMAIL), data);
      
      if (response.data.user) {
        const currentState = await AuthStore.getAuthState();
        await AuthStore.setAuthState({
          token: currentState.token,
          user: response.data.user
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Doğrulama kodunu yeniden gönder
  async resendVerification(email: string) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.RESEND_VERIFICATION), { email });
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Şifremi unuttum
  async forgotPassword(email: string) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.FORGOT_PASSWORD), { email });
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Şifre sıfırlama
  async resetPassword(data: ResetPasswordData) {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.RESET_PASSWORD), data);
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Profil Bilgilerini Güncelle
  async updateProfile(data: UpdateProfileData) {
    try {
      console.log('[AuthService] Profil güncelleme isteği gönderiliyor:', data);
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.put(getFullUrl(AUTH_ENDPOINTS.USER), data, { 
        headers: await this.authHeader(),
      });
      console.log('[AuthService] Profil güncelleme yanıtı alındı:', response.data);

      if (response.data.user) {
        await AuthStore.setUser(response.data.user);
        console.log('[AuthService] Kullanıcı bilgileri AuthStore\'da güncellendi.');
      }
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Profil güncelleme hatası:', error.response?.data || error.message);
      throw new Error(handleApiError(error));
    }
  }

  // Şifre değiştirme
  async changePassword(data: ChangePasswordData) {
    try {
      console.log('[AuthService] Şifre değiştirme isteği gönderiliyor');
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.CHANGE_PASSWORD), data, {
        headers: await this.authHeader(),
      });
      console.log('[AuthService] Şifre değiştirme yanıtı alındı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Şifre değiştirme hatası:', error.response?.data || error.message);
      throw new Error(handleApiError(error));
    }
  }

  // Çıkış işlemi
  async logout() {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.post(getFullUrl(AUTH_ENDPOINTS.LOGOUT), {}, {
        headers: await this.authHeader(),
      });
      
      await AuthStore.clearAll();
      
      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Kullanıcı bilgilerini getir
  async getUser(): Promise<User | null> {
    try {
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.get(getFullUrl(AUTH_ENDPOINTS.USER), {
        headers: await this.authHeader(),
      });
      
      if (response.data.user) {
        const currentState = await AuthStore.getAuthState();
        await AuthStore.setAuthState({
          token: currentState.token,
          user: response.data.user
        });
        return response.data.user;
      }
      
      return null;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  async isAuthenticated(): Promise<boolean> {
    return AuthStore.isAuthenticated();
  }

  // Auth header'ını oluştur
  private async authHeader() {
    const token = await AuthStore.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  // Hesabı Sil
  async deleteAccount() {
    try {
      console.log('[AuthService] Hesap silme isteği gönderiliyor');
      const isConnected = await checkInternetConnection();
      if (!isConnected) {
        throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      const response = await axios.delete(getFullUrl(AUTH_ENDPOINTS.USER), { 
        headers: await this.authHeader(),
      });
      console.log('[AuthService] Hesap silme yanıtı alındı:', response.data);
      await AuthStore.clearAll(); 
      console.log('[AuthService] AuthStore temizlendi.');
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Hesap silme hatası:', error.response?.data || error.message);
      throw new Error(handleApiError(error));
    }
  }
}

export default new AuthService(); 