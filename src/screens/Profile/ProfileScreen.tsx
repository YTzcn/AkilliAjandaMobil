import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MainDrawerParamList } from '../../navigation/MainNavigator'; // Navigator dosya yolunu kontrol et
import { useNavigation } from '@react-navigation/native';
import AuthStore, { User } from '../../store/AuthStore'; // AuthStore ve User import edildi
import AuthService from '../../services/AuthService'; // AuthService import edildi
import { isValidEmail, isStrongPassword } from '../../utils/ValidationUtils'; // Validasyonlar import edildi
import GoogleCalendarService from '../../services/GoogleCalendarService';

// Gerekli ikonları import edelim (varsayılan olarak placeholder, sonra değiştireceğiz)
// import KaydetIcon from '../../assets/icons/save.svg';
// import SifreIcon from '../../assets/icons/lock-reset.svg';
// import GoogleIcon from '../../assets/icons/google.svg';
// import DeleteIcon from '../../assets/icons/delete.svg';
// import WarningIcon from '../../assets/icons/warning.svg';
// import SyncIcon from '../../assets/icons/sync.svg';
// import MenuIcon from '../../assets/icons/menu.svg'; // Header için

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type ProfileScreenNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // State'ler
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null); // Genel hata state'i
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Kullanıcı bilgilerini AuthStore'dan çek
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthStore.getUser();
        if (user) {
          setCurrentUser(user);
          setAdSoyad(user.name);
          setEmail(user.email);
        }
      } catch (err: any) {
        console.error('Kullanıcı bilgileri alınırken hata:', err);
        setError('Kullanıcı bilgileri alınamadı.');
      }
    };
    fetchUser();
  }, []);

  // Google bağlantı durumunu kontrol et
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const googleService = GoogleCalendarService.getInstance();
        const connected = await googleService.checkConnectionStatus();
        setIsGoogleConnected(connected);
      } catch (err) {
        console.error('Google bağlantı kontrolü hatası:', err);
      }
    };
    checkGoogleConnection();
  }, []);

  // Sağ panel için kullanıcı özeti
  const userSummary = useMemo(() => {
    if (!currentUser) {
      return {
        name: 'Kullanıcı Yükleniyor...',
        email: '...',
        avatarChar: '?',
        etkinlikler: 0,
        gorevler: 0,
        tamamlananGorevler: 0,
      };
    }
    return {
      name: currentUser.name,
      email: currentUser.email,
      avatarChar: currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?',
      // Bu değerler API'den veya başka bir yerden gelmeli, şimdilik sabit
      etkinlikler: 36, 
      gorevler: 14,
      tamamlananGorevler: 1,
    };
  }, [currentUser]);

  const handleKaydet = async () => {
    setError(null);
    if (!adSoyad.trim()) {
      setError('Ad soyad boş bırakılamaz.');
      return;
    }
    // E-posta validasyonu (isteğe bağlı, eğer değiştirilebilir ise)
    // if (email.trim() && !isValidEmail(email)) {
    //   setError('Geçerli bir e-posta adresi giriniz.');
    //   return;
    // }

    setLoadingProfile(true);
    try {
      const updateData: { name: string; email?: string } = { name: adSoyad };
      // Eğer e-posta backend tarafından güncellenebiliyorsa ve değişmişse ekle
      // if (currentUser && email !== currentUser.email) {
      //   updateData.email = email;
      // }
      const response = await AuthService.updateProfile(updateData);
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');
      if (response.user) {
        setCurrentUser(response.user); // AuthStore'dan tekrar çekmek yerine yanıttan al
      }
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err.message);
      setError(err.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSifreGuncelle = async () => {
    setError(null);
    if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) {
      setError('Tüm şifre alanları zorunludur.');
      return;
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    const passwordValidation = isStrongPassword(yeniSifre);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoadingPassword(true);
    try {
      await AuthService.changePassword({
        current_password: mevcutSifre,
        password: yeniSifre,
        password_confirmation: yeniSifreTekrar,
      });
      Alert.alert('Başarılı', 'Şifre başarıyla güncellendi.');
      setMevcutSifre('');
      setYeniSifre('');
      setYeniSifreTekrar('');
    } catch (err: any) {
      console.error('Şifre güncelleme hatası:', err.message);
      setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleGoogleBaglan = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const googleService = GoogleCalendarService.getInstance();
      
      // Google yetkilendirme URL'sini al
      const authUrl = await googleService.getAuthUrl();
      
      // Web tarayıcısında aç
      Linking.openURL(authUrl);
      
      // Kullanıcıyı bilgilendir
      Alert.alert(
        'Google Yetkilendirme',
        'Google hesabınızla giriş yapmak için yönlendirileceksiniz. Giriş yaptıktan sonra uygulamamıza geri döneceksiniz.',
        [{ text: 'Tamam' }]
      );
    } catch (err: any) {
      console.error('Google bağlantı hatası:', err);
      setError(err.message || 'Google bağlantısı sırasında bir hata oluştu.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const googleService = GoogleCalendarService.getInstance();
      await googleService.disconnect();
      setIsGoogleConnected(false);
      Alert.alert('Başarılı', 'Google Takvim bağlantısı kaldırıldı.');
    } catch (err: any) {
      console.error('Google bağlantısı kaldırma hatası:', err);
      setError(err.message || 'Google bağlantısı kaldırılırken bir hata oluştu.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleHesabiSil = () => {
    setError(null);
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: async () => {
            console.log('[ProfileScreen] Hesap silme işlemi başlatıldı.');
            setLoadingDelete(true);
            setError(null); // Hata mesajını temizle
            try {
              await AuthService.deleteAccount();
              await AuthStore.clearAll(); // AuthStore'u temizle
              console.log('[ProfileScreen] Hesap başarıyla silindi (AuthService). AuthStore temizlendi.');
              Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi.');
              
              console.log("[ProfileScreen] Auth ekranına yönlendirme yapılıyor...");
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
              console.log('[ProfileScreen] Yönlendirme komutu gönderildi.');
            } catch (err: any) {
              console.error('[ProfileScreen] Hesap silme veya yönlendirme hatası:', err.message, err);
              setError(err.message || 'Hesap silinirken bir hata oluştu.');
            } finally {
              setLoadingDelete(false);
              console.log('[ProfileScreen] Hesap silme işlemi tamamlandı (finally bloğu).');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleTakvimSenkronizasyonu = () => {
    navigation.navigate('CalendarSync');
  };

  // Stil tanımlamaları
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background, // Arka plan rengi
    },
    container: {
      flex: 1,
    },
    scrollViewContent: {
      padding: SIZES.padding * 1.5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SIZES.padding * 2,
    },
    menuButton: {
      padding: SIZES.padding / 2,
      marginRight: SIZES.margin,
    },
    headerTitle: {
      ...FONTS.h1,
      color: COLORS.textDark,
    },
    contentRow: { // Ana içerik ve sağ sidebar için
      flexDirection: isTablet ? 'row' : 'column',
      flex: 1,
    },
    mainContent: { // Profil Bilgileri, Şifre vb.
      flex: isTablet ? 3 : 1, // Tablette daha geniş
      marginRight: isTablet ? SIZES.padding * 1.5 : 0,
    },
    sidebar: { // Hesap Özeti
      flex: isTablet ? 1.5 : 1, // Tablette daha dar
      marginTop: isTablet ? 0 : SIZES.padding * 2,
    },
    card: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius * 1.5,
      padding: SIZES.padding * 1.5,
      marginBottom: SIZES.padding * 1.5,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    cardTitle: {
      ...FONTS.h2,
      color: COLORS.textDark,
      marginBottom: SIZES.margin / 2,
    },
    cardSubtitle: {
      ...FONTS.small,
      color: COLORS.textMedium,
      marginBottom: SIZES.margin * 1.5,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: SIZES.margin * 1.5,
    },
    label: {
      ...FONTS.small,
      color: COLORS.textDark,
      marginBottom: SIZES.margin / 2,
      fontWeight: '500',
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: SIZES.radius,
      paddingHorizontal: SIZES.padding,
      paddingVertical: SIZES.padding * 0.75,
      ...FONTS.input,
      color: COLORS.textDark,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: SIZES.padding,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      ...FONTS.button,
      color: COLORS.white,
      marginLeft: SIZES.margin / 2,
    },
    deleteButton: {
      backgroundColor: COLORS.error,
    },
    deleteButtonText: {
      ...FONTS.button,
      color: COLORS.white,
      marginLeft: SIZES.margin / 2,
    },
    warningBox: {
      backgroundColor: '#FFFBE6', // Sarımsı bir uyarı rengi
      padding: SIZES.padding,
      borderRadius: SIZES.radius,
      marginBottom: SIZES.margin,
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      ...FONTS.small,
      color: '#9F6000', // Koyu sarı/kahve tonu
      marginLeft: SIZES.margin,
    },
    // Sağ Sidebar Stilleri
    summaryCard: {
      alignItems: 'center',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.margin,
    },
    avatarChar: {
      ...FONTS.h1,
      fontSize: 36,
      color: COLORS.white,
    },
    summaryUserName: {
      ...FONTS.h3,
      color: COLORS.textDark,
    },
    summaryUserEmail: {
      ...FONTS.body,
      color: COLORS.textMedium,
      marginBottom: SIZES.margin * 1.5,
    },
    statsContainer: {
      width: '100%',
      marginBottom: SIZES.margin * 1.5,
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SIZES.margin / 2,
    },
    statLabel: {
      ...FONTS.body,
      color: COLORS.textDark,
    },
    statValue: {
      ...FONTS.body,
      color: COLORS.textDark,
      fontWeight: '600',
    },
    hizliBaglantilarTitle: {
        ...FONTS.h3,
        color: COLORS.textDark,
        marginBottom: SIZES.margin,
    },
    outlineButton: {
      backgroundColor: COLORS.white,
      borderColor: COLORS.primary,
      borderWidth: 1.5,
    },
    outlineButtonText: {
      color: COLORS.primary,
    },
    errorText: {
      ...FONTS.small,
      color: COLORS.error,
      textAlign: 'center',
      marginBottom: SIZES.margin,
    },
    buttonInnerContainer: { // Buton içindeki yazı ve spinner için
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <MenuIcon width={SIZES.icon} height={SIZES.icon} color={COLORS.primary} />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.contentRow}>
          {/* Ana İçerik Bölümü */}
          <View style={styles.mainContent}>
            {/* Profil Bilgileri Kartı */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Profil Bilgileri</Text>
              <Text style={styles.cardSubtitle}>
                Hesap bilgilerinizi ve e-posta adresinizi güncelleyin.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput
                  style={styles.input}
                  value={adSoyad}
                  onChangeText={setAdSoyad}
                  placeholder="Adınız Soyadınız"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleKaydet} activeOpacity={0.8} disabled={loadingProfile}>
                {loadingProfile ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  // <KaydetIcon width={20} height={20} color={COLORS.white} />
                  <Text style={styles.buttonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Şifre Güncelleme Kartı */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Şifre Güncelleme</Text>
              <Text style={styles.cardSubtitle}>
                Güvenliğiniz için hesabınızda güçlü bir şifre kullandığınızdan emin olun.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mevcut Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={mevcutSifre}
                  onChangeText={setMevcutSifre}
                  placeholder="••••••••"
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={yeniSifre}
                  onChangeText={setYeniSifre}
                  placeholder="••••••••"
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre Tekrarı</Text>
                <TextInput
                  style={styles.input}
                  value={yeniSifreTekrar}
                  onChangeText={setYeniSifreTekrar}
                  placeholder="••••••••"
                  secureTextEntry
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleSifreGuncelle} activeOpacity={0.8} disabled={loadingPassword}>
                {loadingPassword ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  // <SifreIcon width={20} height={20} color={COLORS.white} />
                  <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Google Takvim Entegrasyonu Kartı */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Google Takvim Entegrasyonu</Text>
              <Text style={styles.cardSubtitle}>
                Google Takvim ile hesabınızı bağlayarak etkinliklerinizi senkronize edebilirsiniz.
              </Text>
              
              {isGoogleConnected ? (
                <>
                  <View style={[styles.warningBox, { backgroundColor: '#E6F4EA' }]}>
                    <Text style={[styles.warningText, { color: '#1E8E3E' }]}>
                      Google Takvim hesabınız bağlı.
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: COLORS.error }]} 
                    onPress={handleGoogleDisconnect} 
                    activeOpacity={0.8}
                    disabled={loadingGoogle}
                  >
                    {loadingGoogle ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Bağlantıyı Kaldır</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      Google Takvim hesabınız henüz bağlanmadı.
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleGoogleBaglan} 
                    activeOpacity={0.8}
                    disabled={loadingGoogle}
                  >
                    {loadingGoogle ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Google ile Bağlan</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Hesabı Sil Kartı */}
            <View style={[styles.card, { backgroundColor: '#FFF5F5' /* Açık kırmızımsı uyarı */ }]}>
              <Text style={[styles.cardTitle, { color: COLORS.error }]}>Hesabı Sil</Text>
              <Text style={[styles.cardSubtitle, {color: '#CC0000' /* Koyu kırmızı */}]}>
                Hesabınız silindiğinde, tüm verileriniz ve kaynaklar kalıcı olarak silinecektir.
                Hesabınızı silmeden önce saklamak istediğiniz verileri veya bilgileri indirin.
              </Text>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleHesabiSil} activeOpacity={0.8} disabled={loadingDelete}>
                {loadingDelete ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  // <DeleteIcon width={20} height={20} color={COLORS.white} />
                  <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sağ Sidebar - Hesap Özeti */}
          <View style={styles.sidebar}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Hesap Özeti</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarChar}>{userSummary.avatarChar}</Text>
                    </View>
                    <Text style={styles.summaryUserName}>{userSummary.name}</Text>
                    <Text style={styles.summaryUserEmail}>{userSummary.email}</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Etkinlikler</Text>
                        <Text style={styles.statValue}>{userSummary.etkinlikler} etkinlik</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Görevler</Text>
                        <Text style={styles.statValue}>{userSummary.gorevler} görev</Text>
                    </View>
                     <View style={styles.statItem}>
                        <Text style={styles.statLabel}></Text>
                        <Text style={styles.statValue}>{userSummary.tamamlananGorevler} tamamlandı</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.hizliBaglantilarTitle}>Hızlı Bağlantılar</Text>
                <TouchableOpacity 
                    style={[styles.button, styles.outlineButton]} 
                    onPress={handleTakvimSenkronizasyonu} 
                    activeOpacity={0.8}
                >
                    {/* <SyncIcon width={20} height={20} color={COLORS.primary} /> */}
                    <Text style={[styles.buttonText, styles.outlineButtonText]}>Takvim Senkronizasyonu</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 