import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  ViewStyle,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AuthService from '../../services/AuthService';
import ErrorMessage from '../../components/ErrorMessage';
import { isValidVerificationCode } from '../../utils/ValidationUtils';

// Import SVG icons
import CalendarIcon from '../../assets/icons/calendar.svg';
import CheckIcon from '../../assets/icons/check.svg';
import NoteIcon from '../../assets/icons/note.svg';
import SendIcon from '../../assets/icons/send.svg';
import AppIcon from '../../assets/icons/app-icon.svg';

const { width, height } = Dimensions.get('window');
const TABLET_BREAKPOINT = 768;

// SidebarItem'ın tip tanımı
interface SidebarItemProps {
  IconComponent: React.FC<{width?: number; height?: number; color?: string; style?: any}>;
  text: string;
}

// Route params için tip tanımlaması
type VerifyEmailRouteParams = {
  VerifyEmail: {
    email: string;
  };
};

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<VerifyEmailRouteParams, 'VerifyEmail'>>();
  
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // E-posta adresini route params'dan al, yoksa varsayılan değer kullan
  const [email, setEmail] = useState(route.params?.email || 'user@example.com');
  
  // Input referanslarını oluşturuyoruz, böylece her bir rakam girildiğinde sonraki input'a geçebiliriz
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  
  // Ekran boyutlarını dinamik olarak takip etmek için state değişkenleri
  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  // Responsive layout
  const isTabletOrLarger = screenDimensions.width >= TABLET_BREAKPOINT;
  const isLandscape = screenDimensions.width > screenDimensions.height;
  const showSidebar = isTabletOrLarger && isLandscape;

  // Ekran boyutu değiştiğinde (rotasyon olduğunda) çalışacak fonksiyon
  useEffect(() => {
    const updateLayout = () => {
      setScreenDimensions({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
      });
    };

    // Dinleyiciyi ekle
    const subscription = Dimensions.addEventListener('change', updateLayout);

    // Component unmount olduğunda dinleyiciyi kaldır
    return () => subscription.remove();
  }, []);

  // Kodu doğrulama işlemi
  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    
    // Doğrulama kodu validasyonu
    const codeValidation = isValidVerificationCode(code);
    if (!codeValidation.isValid) {
      setError(codeValidation.message);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await AuthService.verifyEmail({
        email: route.params.email,
        code: code
      });

      // Başarılı doğrulama
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Kodu yeniden gönderme işlemi
  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError('');
      await AuthService.resendVerification(route.params.email);
      Alert.alert('Başarılı', 'Yeni doğrulama kodu e-posta adresinize gönderildi.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kodun her bir karakteri için input değişim fonksiyonu
  const handleCodeChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) { // Sadece rakamları kabul et
      // Yeni kod dizisini oluştur
      const newVerificationCode = [...verificationCode];
      newVerificationCode[index] = text;
      setVerificationCode(newVerificationCode);
      
      // Eğer bir rakam girildiyse ve bu son input değilse, sonraki input'a geç
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  // Backspace tuşu ile geriye gitme fonksiyonu
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Sidebar item component
  const SidebarItem = ({ IconComponent, text }: SidebarItemProps) => (
    <View style={styles.sidebarCard}>
      <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7}>
        <IconComponent width={20} height={20} color={COLORS.white} style={styles.sidebarIcon} />
        <Text style={styles.sidebarText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );

  // Navigation için tip tanımlaması
  const navigateToLogin = () => {
    // @ts-ignore - Navigasyon tipini görmezden gel
    navigation.navigate('Login');
  };

  // Doğrulama form içeriği
  const renderFormContent = () => (
    <ScrollView 
      style={styles.formScrollContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.formScrollContentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>E-posta Doğrulama</Text>
        <Text style={styles.subtitle}>
          {email} adresine gönderilen 6 haneli doğrulama kodunu giriniz
        </Text>
        
        {error ? <ErrorMessage message={error} /> : null}
        
        {success ? (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <CheckIcon width={24} height={24} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Doğrulama Başarılı!</Text>
            <Text style={styles.successMessage}>
              E-posta adresiniz başarıyla doğrulandı.
              Ana sayfaya yönlendiriliyorsunuz...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>
            
            <TouchableOpacity
              onPress={handleVerifyCode}
              activeOpacity={0.9}
              style={styles.buttonContainer}
            >
              <View style={[
                styles.verifyButton,
                { backgroundColor: COLORS.primary }
              ]}>
                <>
                  <CheckIcon width={20} height={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.verifyButtonText}>Doğrula</Text>
                </>
              </View>
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Kod gelmedi mi? </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                activeOpacity={0.7}
              >
                <Text style={styles.resendLink}>Yeniden Gönder</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={navigateToLogin}
              activeOpacity={0.7}
              style={styles.loginLinkContainer}
            >
              <Text style={styles.loginLink}>← Giriş sayfasına dön</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  // Sidebar content
  const renderSidebarContent = () => (
    <>
      <View style={styles.sidebarHeader}>
        <AppIcon width={30} height={30} color={COLORS.white} />
        <Text style={styles.sidebarTitle}>Akıllı Ajanda</Text>
      </View>
      <Text style={styles.sidebarDescription}>
        Tüm etkinliklerinizi, görevlerinizi ve notlarınızı tek bir yerde organize edin.
      </Text>
      <View style={styles.sidebarMenu}>
        <SidebarItem 
          IconComponent={() => <CalendarIcon width={20} height={20} color={COLORS.white} style={styles.sidebarIcon} />} 
          text="Etkinlikler" 
        />
        <SidebarItem 
          IconComponent={() => <CheckIcon width={20} height={20} color={COLORS.white} style={styles.sidebarIcon} />} 
          text="Görevler" 
        />
        <SidebarItem 
          IconComponent={() => <NoteIcon width={20} height={20} color={COLORS.white} style={styles.sidebarIcon} />} 
          text="Notlar" 
        />
      </View>
    </>
  );

  // Responsive stillerini useMemo içinde oluşturalım
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SIZES.padding,
      paddingHorizontal: 10,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SIZES.padding * 2,
      paddingHorizontal: 10,
    },
    outerContainer: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius * 2,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      maxWidth: 1200,
      flex: 1, // Dikey modda daha fazla alan kaplar
    },
    sidebarContainer: {
      backgroundColor: COLORS.primary,
      padding: SIZES.padding * 2,
      justifyContent: 'flex-start',
      paddingTop: SIZES.padding * 4,
      flex: 1,
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SIZES.margin,
    },
    sidebarTitle: {
      ...FONTS.h2,
      color: COLORS.white,
      marginLeft: SIZES.margin,
    },
    sidebarDescription: {
      ...FONTS.body,
      color: COLORS.white,
      marginBottom: SIZES.padding * 3,
      lineHeight: 22,
    },
    sidebarMenu: {
      marginTop: SIZES.padding,
    },
    sidebarCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: SIZES.radius,
      marginBottom: SIZES.margin,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SIZES.padding * 1.5,
      paddingHorizontal: SIZES.padding * 1.5,
    },
    sidebarIcon: {
      marginRight: SIZES.padding * 1.5,
    },
    sidebarText: {
      ...(FONTS.body || {}),
      color: COLORS.white,
      fontWeight: '500',
      fontSize: 16,
    },
    formSection: {
      backgroundColor: COLORS.white,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding * 2,
      flex: 1,
    },
    formScrollContainer: {
      flex: 1,
      width: '100%',
      maxWidth: isTabletOrLarger ? 450 : '100%',
      alignSelf: 'center',
    },
    formScrollContentContainer: {
      flexGrow: 1,
      paddingVertical: SIZES.padding,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: isTabletOrLarger ? Math.min(SIZES.padding, 12) : 0,
    },
    formContainer: {
      width: '100%',
      maxWidth: isTabletOrLarger ? 400 : '100%',
      alignSelf: 'center',
      alignItems: 'flex-start',
    },
    title: {
      ...FONTS.h1,
      color: COLORS.textDark,
      fontSize: isTabletOrLarger ? 32 : 28,
      marginBottom: SIZES.margin * 0.8,
      width: '100%',
    },
    subtitle: {
      ...FONTS.body,
      color: COLORS.textMedium,
      marginBottom: SIZES.margin * 2,
      fontSize: isTabletOrLarger ? 16 : 15,
      width: '100%',
    },
    codeInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: SIZES.margin * 3,
    },
    codeInput: {
      width: 42,
      height: 50,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: SIZES.radius,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      backgroundColor: COLORS.inputBackground,
      color: COLORS.primary,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: isTabletOrLarger ? 400 : '100%',
      borderRadius: SIZES.radius,
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      marginBottom: SIZES.margin * 2,
      marginTop: isTabletOrLarger ? SIZES.margin : 0,
      alignSelf: 'center',
    },
    verifyButton: {
      flexDirection: 'row',
      width: '100%',
      height: isTabletOrLarger ? SIZES.buttonHeight + 8 : SIZES.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radius,
    },
    verifyButtonText: {
      ...(FONTS.body || {}),
      color: COLORS.white,
      fontWeight: 'bold',
      fontSize: 16,
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.margin * 2,
      width: '100%',
    },
    resendText: {
      ...FONTS.body,
      color: COLORS.textMedium,
    },
    resendLink: {
      ...FONTS.body,
      color: COLORS.primary,
      fontWeight: 'bold',
    },
    loginLinkContainer: {
      alignItems: 'center',
      width: '100%',
      marginTop: SIZES.margin,
    },
    loginLink: {
      ...FONTS.body,
      color: COLORS.primary,
      fontWeight: 'bold',
      fontSize: isTabletOrLarger ? 16 : 14,
    },
    mobileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SIZES.margin * 2,
      width: '100%',
    },
    mobileHeaderTitle: {
      ...FONTS.h2,
      color: COLORS.primary,
      marginLeft: SIZES.margin,
    },
    successContainer: {
      width: '100%',
      maxWidth: isTabletOrLarger ? 400 : '100%',
      alignItems: 'center',
      marginTop: SIZES.margin,
      paddingHorizontal: isTabletOrLarger ? Math.min(SIZES.padding * 2, 24) : SIZES.padding,
      alignSelf: 'center',
    },
    successIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: COLORS.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.margin * 1.5,
    },
    successTitle: {
      ...FONTS.h2,
      color: COLORS.textDark,
      fontSize: isTabletOrLarger ? 24 : 20,
      marginBottom: SIZES.margin,
    },
    successMessage: {
      ...FONTS.body,
      color: COLORS.textMedium,
      textAlign: 'center',
      marginBottom: SIZES.margin,
      lineHeight: isTabletOrLarger ? 24 : 20,
      maxWidth: isTabletOrLarger ? 380 : 330,
    },
  }), [isTabletOrLarger]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.mainContainer}>
          {!showSidebar && (
            <View style={styles.mobileHeader}>
              <AppIcon width={30} height={30} color={COLORS.primary} />
              <Text style={styles.mobileHeaderTitle}>Akıllı Ajanda</Text>
            </View>
          )}
          
          <View style={[
            styles.outerContainer, 
            {
              flexDirection: showSidebar ? 'row' : 'column',
              width: isTabletOrLarger ? Math.min(screenDimensions.width * 0.85, 900) : screenDimensions.width * 0.9,
              height: showSidebar ? Math.min(screenDimensions.height * 0.85, 700) : undefined,
              maxHeight: showSidebar ? 700 : undefined,
              flex: 1,
            }
          ]}>
            {showSidebar ? (
              <>
                <View style={[
                  styles.sidebarContainer, 
                  {
                    flex: 0.8,
                    minWidth: 220,
                    maxWidth: 320,
                    width: undefined,
                    paddingBottom: SIZES.padding * 2,
                    borderTopLeftRadius: SIZES.radius * 2,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: SIZES.radius * 2,
                    borderBottomRightRadius: 0,
                  }
                ]}>
                  {renderSidebarContent()}
                </View>
                <View style={[
                  styles.formSection, 
                  {
                    flex: 1.2,
                    width: undefined,
                    paddingTop: SIZES.padding * 2,
                    paddingBottom: SIZES.padding * 2,
                    paddingHorizontal: Math.min(SIZES.padding * 3, 32),
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: SIZES.radius * 2,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: SIZES.radius * 2,
                  }
                ]}>
                  {renderFormContent()}
                </View>
              </>
            ) : (
              <>
                <View style={[
                  styles.formSection, 
                  {
                    flex: 1,
                    width: '100%',
                    paddingTop: SIZES.padding * 3,
                    paddingBottom: SIZES.padding * 3,
                    paddingHorizontal: SIZES.padding * 2,
                    borderTopLeftRadius: SIZES.radius * 2,
                    borderTopRightRadius: SIZES.radius * 2,
                    borderBottomLeftRadius: SIZES.radius * 2,
                    borderBottomRightRadius: SIZES.radius * 2,
                  }
                ]}>
                  {renderFormContent()}
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmailScreen; 