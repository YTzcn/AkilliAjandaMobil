import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
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
import { StackNavigationProp } from '@react-navigation/stack';

// Type for navigation prop
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Import SVG icons
import CalendarIcon from '../../assets/icons/calendar.svg';
import CheckIcon from '../../assets/icons/check.svg';
import NoteIcon from '../../assets/icons/note.svg';
import LoginIcon from '../../assets/icons/login.svg';
import VisibilityOnIcon from '../../assets/icons/visibility-on.svg';
import VisibilityOffIcon from '../../assets/icons/visibility-off.svg';
import AppIcon from '../../assets/icons/app-icon.svg';

const { width, height } = Dimensions.get('window');
const TABLET_BREAKPOINT = 768;

// SidebarItem'ın tip tanımını ekleyeceğim
interface SidebarItemProps {
  IconComponent: React.FC<{width?: number; height?: number; color?: string; style?: any}>;
  text: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const isTabletOrLarger = width >= TABLET_BREAKPOINT;

  const handleLogin = () => {
    if (!email || !password) {
      console.log('Email and password required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log('Logging in with:', email, password, 'Remember Me:', rememberMe);
      setLoading(false);
      // Navigate to Main screen after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 1500);
  };

  // Updated SidebarItem to handle both text and SVG components
  const SidebarItem = ({ IconComponent, text }: SidebarItemProps) => (
    <View style={styles.sidebarCard}>
      <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7}>
        <IconComponent width={20} height={20} color={COLORS.white} style={styles.sidebarIcon} />
        <Text style={styles.sidebarText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );

  // Helper function to render the form content
  const renderFormContent = () => (
    <ScrollView 
      style={styles.formScrollContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.formScrollContentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>
          Ajandanıza erişmek için hesabınıza giriş yapın
        </Text>
        
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
        
        <View style={styles.passwordHeaderContainer}>
          <Text style={styles.label}>Şifre</Text>
          <TouchableOpacity
            style={styles.forgotPasswordInline}
            onPress={navigateToForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputContainer, styles.passwordInputContainer]}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.inputIconRight}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <VisibilityOffIcon width={SIZES.icon} height={SIZES.icon} color={COLORS.textMedium} />
            ) : (
              <VisibilityOnIcon width={SIZES.icon} height={SIZES.icon} color={COLORS.textMedium} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.customCheckbox}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            {rememberMe ? (
              <View style={styles.customCheckboxChecked}>
                <CheckIcon width={14} height={14} color={COLORS.white} />
              </View>
            ) : (
              <View style={styles.customCheckboxUnchecked} />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Beni Hatırla</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.9}
          disabled={loading}
          style={styles.buttonContainer}
        >
          <View style={[
            styles.loginButton,
            { backgroundColor: COLORS.primary },
            { opacity: loading ? 0.5 : 1 },
          ]}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <LoginIcon width={20} height={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        
        {renderRegisterLink()}
      </View>
    </ScrollView>
  );

  // Helper function to render the sidebar content
  const renderSidebarContent = () => (
    <>
      <View style={styles.sidebarHeader}>
        {/* Restored SVG app icon with proper props */}
        <AppIcon width={30} height={30} color={COLORS.white} />
        <Text style={styles.sidebarTitle}>Akıllı Ajanda</Text>
      </View>
      <Text style={styles.sidebarDescription}>
        Tüm etkinliklerinizi, görevlerinizi ve notlarınızı tek bir yerde organize edin.
      </Text>
      <View style={styles.sidebarMenu}>
        {/* Restored all SVG sidebar icons with proper props */}
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

  // Navigation için tip tanımlamasını ekleyelim
  const navigateToRegister = () => {
    // @ts-ignore - Navigasyon tipini görmezden gel
    navigation.navigate('Register');
  };

  // Şifremi Unuttum yönlendirmesi
  const navigateToForgotPassword = () => {
    // @ts-ignore - Navigasyon tipini görmezden gel
    navigation.navigate('ForgotPassword');
  };

  // Register Link
  const renderRegisterLink = () => (
    <View style={styles.registerContainer}>
      <Text style={styles.registerText}>Hesabınız yok mu? </Text>
      <TouchableOpacity
        onPress={navigateToRegister}
        activeOpacity={0.7}
      >
        <Text style={styles.registerLink}>Kayıt Olun</Text>
      </TouchableOpacity>
    </View>
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
      marginBottom: SIZES.margin * 1.2,
      paddingHorizontal: SIZES.padding,
    },
    input: {
      flex: 1,
      ...FONTS.body,
      color: COLORS.textDark,
      fontSize: isTabletOrLarger ? 16 : 14,
    },
    inputIconRight: {
      padding: SIZES.padding / 2,
    },
    passwordHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: SIZES.margin / 2,
    },
    forgotPasswordInline: {
      paddingVertical: 4,
    },
    forgotPasswordText: {
      ...FONTS.small,
      color: COLORS.primary,
      fontWeight: '600',
      fontSize: isTabletOrLarger ? 14 : 13,
    },
    passwordInputContainer: {
      marginBottom: SIZES.margin * 1.5,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isTabletOrLarger ? SIZES.margin * 2.5 : SIZES.margin * 2,
      alignSelf: 'flex-start',
    },
    customCheckbox: {
      width: 22,
      height: 22,
      marginRight: SIZES.margin,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      borderWidth: 2,
      borderColor: COLORS.primary,
      backgroundColor: 'transparent',
    },
    customCheckboxChecked: {
      width: '100%',
      height: '100%',
      backgroundColor: COLORS.primary,
      borderRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    customCheckboxUnchecked: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      borderRadius: 2,
    },
    checkboxLabel: {
      ...FONTS.body,
      color: COLORS.textMedium,
      fontSize: isTabletOrLarger ? 15 : 14,
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
    loginButton: {
      flexDirection: 'row',
      width: '100%',
      height: isTabletOrLarger ? SIZES.buttonHeight + 8 : SIZES.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radius,
    },
    loginButtonText: {
      ...(FONTS.body || {}),
      color: COLORS.white,
      fontWeight: 'bold',
      fontSize: 16,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: SIZES.margin,
      width: '100%',
    },
    registerText: {
      ...FONTS.body,
      color: COLORS.textMedium,
    },
    registerLink: {
      ...FONTS.body,
      color: COLORS.primary,
      fontWeight: 'bold',
    },
    errorText: {
      ...FONTS.error,
      color: COLORS.error,
      width: '100%',
      textAlign: 'left',
      marginTop: -SIZES.margin + 4,
      marginBottom: SIZES.margin - 4,
      paddingLeft: SIZES.padding,
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

export default LoginScreen; 