import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';

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

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Responsive layout
  const isTabletOrLarger = width >= TABLET_BREAKPOINT;

  // Handle password reset link
  const handleSendResetLink = () => {
    if (!email) {
      console.log('E-posta adresi zorunludur');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Şifre sıfırlama bağlantısı gönderiliyor:', email);
      setLoading(false);
      setSuccess(true);
    }, 1500);
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

  // Şifremi unuttum form içeriği
  const renderFormContent = () => (
    <ScrollView 
      style={styles.formScrollContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.formScrollContentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          Şifrenizi sıfırlamak için e-posta adresinizi girin
        </Text>
        
        {success ? (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <CheckIcon width={24} height={24} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Bağlantı Gönderildi!</Text>
            <Text style={styles.successMessage}>
              Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
              Lütfen gelen kutunuzu kontrol edin.
            </Text>
            <TouchableOpacity
              onPress={navigateToLogin}
              activeOpacity={0.9}
              style={[styles.buttonContainer, { marginTop: SIZES.margin * 2 }]}
            >
              <View style={[
                styles.resetButton,
                { backgroundColor: COLORS.primary },
              ]}>
                <Text style={styles.resetButtonText}>Giriş Sayfasına Dön</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.label}>E-posta Adresi</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <TouchableOpacity
              onPress={handleSendResetLink}
              activeOpacity={0.9}
              disabled={loading}
              style={styles.buttonContainer}
            >
              <View style={[
                styles.resetButton,
                { backgroundColor: COLORS.primary },
                { opacity: loading ? 0.5 : 1 },
              ]}>
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <SendIcon width={20} height={20} color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.resetButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            
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
    },
    sidebarContainer: {
      backgroundColor: COLORS.primary,
      padding: SIZES.padding * 2,
      justifyContent: 'flex-start',
      paddingTop: SIZES.padding * 4,
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
    },
    formScrollContainer: {
      width: '100%',
      height: '100%',
    },
    formScrollContentContainer: {
      flexGrow: 1,
      paddingVertical: SIZES.padding,
      justifyContent: 'center',
    },
    formContainer: {
      width: '100%',
      maxWidth: isTabletOrLarger ? 450 : 400,
      alignItems: 'flex-start',
      alignSelf: 'center',
    },
    title: {
      ...FONTS.h1,
      color: COLORS.textDark,
      marginBottom: isTabletOrLarger ? SIZES.margin * 1.2 : SIZES.margin / 2,
      alignSelf: 'flex-start',
      fontSize: isTabletOrLarger ? 32 : 28,
    },
    subtitle: {
      ...FONTS.body,
      color: COLORS.textMedium,
      marginBottom: isTabletOrLarger ? SIZES.margin * 3 : SIZES.margin * 2.5,
      alignSelf: 'flex-start',
      fontSize: isTabletOrLarger ? 16 : 14,
      lineHeight: isTabletOrLarger ? 24 : 20,
    },
    label: {
      ...FONTS.small,
      color: COLORS.textDark,
      fontWeight: '600',
      marginBottom: SIZES.margin / 2,
      alignSelf: 'flex-start',
      fontSize: isTabletOrLarger ? 15 : 14,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: isTabletOrLarger ? SIZES.inputHeight + 6 : SIZES.inputHeight,
      backgroundColor: COLORS.inputBackground,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: SIZES.margin * 2,
      paddingHorizontal: SIZES.padding,
    },
    input: {
      flex: 1,
      ...FONTS.body,
      color: COLORS.textDark,
      fontSize: isTabletOrLarger ? 16 : 14,
    },
    buttonContainer: {
      width: '100%',
      borderRadius: SIZES.radius,
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      marginBottom: SIZES.margin * 2,
      marginTop: isTabletOrLarger ? SIZES.margin : 0,
    },
    resetButton: {
      flexDirection: 'row',
      width: '100%',
      height: isTabletOrLarger ? SIZES.buttonHeight + 8 : SIZES.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radius,
    },
    resetButtonText: {
      ...(FONTS.body || {}),
      color: COLORS.white,
      fontWeight: 'bold',
      fontSize: 16,
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
      alignItems: 'center',
      marginTop: SIZES.margin,
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isTabletOrLarger && (
            <View style={styles.mobileHeader}>
              <AppIcon width={30} height={30} color={COLORS.primary} />
              <Text style={styles.mobileHeaderTitle}>Akıllı Ajanda</Text>
            </View>
          )}
          
          <View style={[
            styles.outerContainer, 
            {
              flexDirection: isTabletOrLarger ? 'row' : 'column',
              width: isTabletOrLarger ? width * 0.85 : width * 0.9,
              height: isTabletOrLarger ? height * 0.75 : undefined,
              maxHeight: isTabletOrLarger ? 700 : undefined,
              minHeight: isTabletOrLarger ? 500 : undefined,
              marginVertical: SIZES.padding,
            }
          ]}>
            {isTabletOrLarger ? (
              <>
                <View style={[
                  styles.sidebarContainer, 
                  {
                    flex: isTabletOrLarger ? 1 : undefined,
                    width: isTabletOrLarger ? undefined : '100%',
                    paddingBottom: isTabletOrLarger ? SIZES.padding * 2 : SIZES.padding * 3,
                    borderTopLeftRadius: isTabletOrLarger ? SIZES.radius * 2 : 0,
                    borderTopRightRadius: isTabletOrLarger ? 0 : 0,
                    borderBottomLeftRadius: SIZES.radius * 2,
                    borderBottomRightRadius: isTabletOrLarger ? 0 : SIZES.radius * 2,
                  }
                ]}>
                  {renderSidebarContent()}
                </View>
                <View style={[
                  styles.formSection, 
                  {
                    flex: isTabletOrLarger ? 1.5 : undefined,
                    width: isTabletOrLarger ? undefined : '100%',
                    paddingTop: isTabletOrLarger ? SIZES.padding * 2 : SIZES.padding * 4,
                    paddingBottom: isTabletOrLarger ? SIZES.padding * 2 : SIZES.padding * 4,
                    paddingHorizontal: isTabletOrLarger ? SIZES.padding * 3 : SIZES.padding * 2,
                    borderTopLeftRadius: isTabletOrLarger ? 0 : SIZES.radius * 2,
                    borderTopRightRadius: SIZES.radius * 2,
                    borderBottomLeftRadius: isTabletOrLarger ? 0 : 0,
                    borderBottomRightRadius: isTabletOrLarger ? SIZES.radius * 2 : 0,
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
                    flex: isTabletOrLarger ? 1.5 : undefined,
                    width: isTabletOrLarger ? undefined : '100%',
                    paddingTop: isTabletOrLarger ? SIZES.padding * 2 : SIZES.padding * 4,
                    paddingBottom: isTabletOrLarger ? SIZES.padding * 2 : SIZES.padding * 4,
                    paddingHorizontal: isTabletOrLarger ? SIZES.padding * 3 : SIZES.padding * 2,
                    borderTopLeftRadius: isTabletOrLarger ? 0 : SIZES.radius * 2,
                    borderTopRightRadius: SIZES.radius * 2,
                    borderBottomLeftRadius: isTabletOrLarger ? 0 : 0,
                    borderBottomRightRadius: isTabletOrLarger ? SIZES.radius * 2 : 0,
                  }
                ]}>
                  {renderFormContent()}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen; 