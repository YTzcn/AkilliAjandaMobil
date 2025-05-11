import React, { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import GoogleCalendarService from './services/GoogleCalendarService';
import MainNavigator from './navigation/MainNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

// Deep link handler'ı ayrı bir component'e taşıyalım
const DeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('google-auth-callback')) {
        try {
          const code = url.split('code=')[1]?.split('&')[0];
          if (code) {
            const googleService = GoogleCalendarService.getInstance();
            await googleService.handleAuthCode(code);
            Alert.alert(
              'Başarılı',
              'Google Takvim hesabınız başarıyla bağlandı.',
              [
                {
                  text: 'Tamam',
                  onPress: () => {
                    navigation.navigate('CalendarSync' as never);
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error('Google auth callback hatası:', error);
          Alert.alert('Hata', 'Google Takvim bağlantısı sırasında bir hata oluştu.');
        }
      }
    };

    // Deep link listener'ları ekle
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Initial URL'i kontrol et
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return null;
};

export default App; 