import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const handleApiError = (error: any): string => {
  if (!error.response) {
    return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
  }

  switch (error.response?.status) {
    case 400:
      return error.response.data?.message || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
    case 401:
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz bulunmuyor.';
    case 404:
      return 'İstek yapılan kaynak bulunamadı.';
    case 422:
      // Validation hatalarını işle
      const validationErrors = error.response.data?.errors;
      if (validationErrors) {
        return Object.values(validationErrors).flat().join('\n');
      }
      return error.response.data?.message || 'Doğrulama hatası. Lütfen bilgilerinizi kontrol edin.';
    case 429:
      return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin ve tekrar deneyin.';
    case 500:
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    default:
      return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
}; 