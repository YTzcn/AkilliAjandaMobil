import axios from 'axios';

// API Temel URL'si
export const BASE_URL = 'http://192.168.37.126:8000'; // Geliştirme ortamı için yerel IP

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