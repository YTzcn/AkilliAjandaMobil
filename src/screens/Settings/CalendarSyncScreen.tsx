import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme'; // Stil yolu düzeltildi
import { DrawerNavigationProp } from '@react-navigation/drawer';
// import { MainDrawerParamList } from '../../../navigation/MainNavigator'; // Navigatör yolu düzeltildi
type MainDrawerParamList = {
  Dashboard: undefined;
  CalendarSync: undefined;
  // Diğer ekranlar burada tanımlanabilir
};
import { useNavigation } from '@react-navigation/native';

// İkonlar için placeholder (sonra eklenecek)
// import TrashIcon from '../../../assets/icons/trash.svg';
// import ExportIcon from '../../../assets/icons/export.svg';
// import ImportIcon from '../../../assets/icons/import.svg';
// import CalendarDateIcon from '../../../assets/icons/calendar-date.svg';
// import MenuIcon from '../../../assets/icons/menu.svg'; // Header için

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type CalendarSyncScreenNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'CalendarSync'>;

const CalendarSyncScreen = () => {
  const navigation = useNavigation<CalendarSyncScreenNavigationProp>();

  // State'ler
  const [isGoogleConnected, setIsGoogleConnected] = useState(true); // Varsayılan olarak bağlı
  const [startDate, setStartDate] = useState('gg.aa.yyyy');
  const [endDate, setEndDate] = useState('gg.aa.yyyy');

  const handleGoogleBaglantisiniKaldir = () => {
    setIsGoogleConnected(false);
    Alert.alert('Bağlantı Kaldırıldı', 'Google Takvim bağlantısı kaldırıldı.');
  };

  const handleDisaAktar = () => {
    Alert.alert('Dışa Aktar', 'Etkinlikler Google Takvim\'e aktarılıyor...');
  };

  const handleIceAktar = () => {
    Alert.alert(
      'İçe Aktar',
      `Etkinlikler ${startDate} - ${endDate} tarihleri arasında içe aktarılıyor...`
    );
  };

  // Stil tanımlamaları
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background, 
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
      marginBottom: SIZES.margin * 1.5, // Alt başlık için daha fazla boşluk
    },
    cardSubtitle: { // Genel açıklama metinleri için
      ...FONTS.body,
      color: COLORS.textMedium,
      marginBottom: SIZES.margin,
      lineHeight: 20,
    },
    successBox: {
      backgroundColor: '#E6FFFA', // Açık yeşilimsi bir renk
      padding: SIZES.padding,
      borderRadius: SIZES.radius,
      marginBottom: SIZES.margin * 1.5,
    },
    successText: {
      ...FONTS.body,
      color: '#00664F', // Koyu yeşil
    },
    removeButton: {
      backgroundColor: COLORS.error,
      paddingVertical: SIZES.padding * 0.75,
      paddingHorizontal: SIZES.padding * 1.5,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      alignSelf: 'flex-start', // Butonu sola yasla
    },
    removeButtonText: {
      ...FONTS.button,
      fontSize: 14, // Biraz daha küçük font
      color: COLORS.white,
      marginLeft: SIZES.margin / 2,
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: SIZES.padding,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: SIZES.margin, // Diğer elementlerden ayırmak için
    },
    buttonText: {
      ...FONTS.button,
      color: COLORS.white,
      marginLeft: SIZES.margin / 2,
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.margin,
      },
      dateInputGroup: {
        flex: 1,
        marginRight: SIZES.margin /2, // Inputlar arası boşluk
      },
      dateInputGroupLast: {
        marginRight: 0,
      },
      label: {
        ...FONTS.small,
        color: COLORS.textDark,
        marginBottom: SIZES.margin / 2,
        fontWeight: '500',
      },
      dateInput: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding * 0.75,
        ...FONTS.input,
        color: COLORS.textDark,
        borderWidth: 1,
        borderColor: COLORS.border,
        textAlign: 'center',
      },
      dateInputIcon: {
        position: 'absolute',
        right: SIZES.padding / 2,
        top: SIZES.padding / 1.2, // Dikeyde ortalamak için ayar
      },
      infoText: {
        ...FONTS.small,
        color: COLORS.textMedium,
        marginTop: SIZES.margin / 2,
      },
  }), [isGoogleConnected]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
            <MenuIcon width={SIZES.icon} height={SIZES.icon} color={COLORS.primary} />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Takvim Senkronizasyonu</Text>
        </View>

        {/* Google Takvim Senkronizasyonu Kartı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Google Takvim Senkronizasyonu</Text>
          {isGoogleConnected ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Google Takvim ile bağlantınız kurulmuş. Aşağıdaki seçenekler ile senkronizasyon işlemlerini gerçekleştirebilirsiniz.
              </Text>
            </View>
          ) : (
            <Text style={styles.cardSubtitle}>
              Google Takvim ile henüz bir bağlantı kurulmamış. Lütfen Profil sayfanızdan bağlantıyı kurun.
            </Text>
          )}
          {isGoogleConnected && (
            <TouchableOpacity 
                style={styles.removeButton} 
                onPress={handleGoogleBaglantisiniKaldir} 
                activeOpacity={0.8}
            >
              {/* <TrashIcon width={16} height={16} color={COLORS.white} /> */}
              <Text style={styles.removeButtonText}>Google Bağlantısını Kaldır</Text>
            </TouchableOpacity>
          )}
        </View>

        {isGoogleConnected && (
          <>
            {/* Etkinlikleri Google Takvim'e Aktar */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Etkinlikleri Google Takvim'e Aktar</Text>
              <Text style={styles.cardSubtitle}>
                Uygulamadaki etkinliklerinizi Google Takvim'e aktarın.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleDisaAktar} activeOpacity={0.8}>
                {/* <ExportIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.buttonText}>Dışa Aktar</Text>
              </TouchableOpacity>
            </View>

            {/* Google Takvim'den Etkinlikleri İçe Aktar */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Google Takvim'den Etkinlikleri İçe Aktar</Text>
              <Text style={styles.cardSubtitle}>
                Google Takvim'deki etkinliklerinizi uygulamaya aktarın.
              </Text>
              <View style={styles.dateInputContainer}>
                <View style={styles.dateInputGroup}>
                  <Text style={styles.label}>Başlangıç Tarihi</Text>
                  <View>
                    <Text style={styles.dateInput}>{startDate}</Text>
                    {/* <CalendarDateIcon width={18} height={18} color={COLORS.textMedium} style={styles.dateInputIcon} /> */}
                  </View>
                </View>
                <View style={[styles.dateInputGroup, styles.dateInputGroupLast]}>
                  <Text style={styles.label}>Bitiş Tarihi</Text>
                  <View>
                    <Text style={styles.dateInput}>{endDate}</Text>
                    {/* <CalendarDateIcon width={18} height={18} color={COLORS.textMedium} style={styles.dateInputIcon} /> */}
                  </View>
                </View>
              </View>
              <Text style={styles.infoText}>
                Tarih seçilmezse son 30 gün ve gelecek 60 gün içindeki etkinlikler içe aktarılacaktır.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleIceAktar} activeOpacity={0.8}>
                {/* <ImportIcon width={20} height={20} color={COLORS.white} /> */}
                <Text style={styles.buttonText}>İçe Aktar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarSyncScreen; 