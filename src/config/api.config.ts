import axios from 'axios';

// API URL'sini ortama göre ayarla
export const BASE_URL = __DEV__ 
  ? 'http:///192.168.37.126:8000' // Android Emulator için localhost
  : 'https://api.akilliajanda.com'; // Production URL

// API istek zaman aşımı süresi (ms)
export const API_TIMEOUT = 30000;

// API istekleri için varsayılan başlıklar
export const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// API hata mesajları
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı',
  SERVER_ERROR: 'Sunucu hatası oluştu',
  UNAUTHORIZED: 'Oturum süreniz doldu',
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'İstenilen kaynak bulunamadı',
  VALIDATION_ERROR: 'Girdiğiniz bilgileri kontrol edin',
  DEFAULT: 'Bir hata oluştu',
};

// Axios varsayılan yapılandırması
axios.defaults.timeout = 10000; // 10 saniye
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// İstek ve yanıt interceptor'ları
axios.interceptors.request.use(
  (config) => {
    console.log('[Axios] İstek gönderiliyor:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ? JSON.parse(JSON.stringify(config.data)) : null
    });
    return config;
  },
  (error) => {
    console.error('[Axios] İstek hatası:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log('[Axios] Yanıt alındı:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[Axios] Yanıt hatası:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    return Promise.reject(error);
  }
);

// Auth endpoint'leri
export const AUTH_ENDPOINTS = {
  REGISTER: '/api/register',
  LOGIN: '/api/login',
  VERIFY_EMAIL: '/api/verify-email',
  RESEND_VERIFICATION: '/api/resend-verification',
  FORGOT_PASSWORD: '/api/forgot-password',
  RESET_PASSWORD: '/api/reset-password',
  CHANGE_PASSWORD: '/api/change-password',
  LOGOUT: '/api/logout',
  USER: '/api/user',
} as const;

// Tam URL'leri oluşturan yardımcı fonksiyon
export const getFullUrl = (endpoint: string): string => `${BASE_URL}${endpoint}`; 