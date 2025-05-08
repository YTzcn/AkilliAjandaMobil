import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MainDrawerParamList } from '../../navigation/MainNavigator'; // Navigator dosya yolunu kontrol et
import { useNavigation } from '@react-navigation/native';

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
  const [adSoyad, setAdSoyad] = useState('Demo Kullanıcı');
  const [email, setEmail] = useState('demo@example.com');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');

  // Örnek kullanıcı verisi (sağ panel için)
  const userSummary = {
    name: 'Demo Kullanıcı',
    email: 'demo@example.com',
    avatarChar: 'D',
    etkinlikler: 36,
    gorevler: 14,
    tamamlananGorevler: 1,
  };

  const handleKaydet = () => {
    Alert.alert('Kaydedildi', 'Profil bilgileri güncellendi.');
  };

  const handleSifreGuncelle = () => {
    if (yeniSifre !== yeniSifreTekrar) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    Alert.alert('Başarılı', 'Şifre güncellendi.');
  };

  const handleGoogleBaglan = () => {
    Alert.alert('Google Entegrasyonu', 'Google ile bağlanma işlemi başlatıldı.');
  };

  const handleHesabiSil = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', onPress: () => console.log('Hesap silindi'), style: 'destructive' },
      ]
    );
  };
  
  const handleTakvimSenkronizasyonu = () => {
    // Alert.alert('Takvim Senkronizasyonu', 'Takvim senkronizasyonu başlatıldı.');
    navigation.navigate('CalendarSync'); // Yönlendirme eklendi
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
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleKaydet} activeOpacity={0.8}>
                {/* <KaydetIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.buttonText}>Kaydet</Text>
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
              <TouchableOpacity style={styles.button} onPress={handleSifreGuncelle} activeOpacity={0.8}>
                {/* <SifreIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
              </TouchableOpacity>
            </View>

            {/* Google Takvim Entegrasyonu Kartı */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Google Takvim Entegrasyonu</Text>
              <Text style={styles.cardSubtitle}>
                Google Takvim ile hesabınızı bağlayarak etkinliklerinizi senkronize edebilirsiniz.
              </Text>
              <View style={styles.warningBox}>
                {/* <WarningIcon width={20} height={20} color="#9F6000" /> */}
                <Text style={styles.warningText}>Google Takvim hesabınız henüz bağlanmadı.</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleGoogleBaglan} activeOpacity={0.8}>
                {/* <GoogleIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.buttonText}>Google ile Bağlan</Text>
              </TouchableOpacity>
            </View>

            {/* Hesabı Sil Kartı */}
            <View style={[styles.card, { backgroundColor: '#FFF5F5' /* Açık kırmızımsı uyarı */ }]}>
              <Text style={[styles.cardTitle, { color: COLORS.error }]}>Hesabı Sil</Text>
              <Text style={[styles.cardSubtitle, {color: '#CC0000' /* Koyu kırmızı */}]}>
                Hesabınız silindiğinde, tüm verileriniz ve kaynaklar kalıcı olarak silinecektir.
                Hesabınızı silmeden önce saklamak istediğiniz verileri veya bilgileri indirin.
              </Text>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleHesabiSil} activeOpacity={0.8}>
                {/* <DeleteIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
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