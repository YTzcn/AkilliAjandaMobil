import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/tr';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { MainDrawerParamList } from '../../navigation/MainNavigator';

// SVG ikonları için import
import CalendarIcon from '../../assets/icons/calendar.svg';
import CheckIcon from '../../assets/icons/check.svg';
import NoteIcon from '../../assets/icons/note.svg';
import HomeIcon from '../../assets/icons/app-icon.svg';
import AddIcon from '../../assets/icons/add.svg';
import LocationIcon from '../../assets/icons/location.svg';
import TimeIcon from '../../assets/icons/time.svg';
import MenuIcon from '../../assets/icons/menu.svg';

const { width } = Dimensions.get('window');
const TABLET_BREAKPOINT = 768;
const isTablet = width >= TABLET_BREAKPOINT;

// Türkçe dil ayarı
moment.locale('tr');

// Takvim için Türkçe lokalizasyon
LocaleConfig.locales['tr'] = {
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık'
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

// Etkinlik veri tipi
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

// Görev veri tipi
interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

// Örnek veri
const upcomingEvents: Event[] = [
  { id: '1', title: 'Proje Teslimi', date: '2023-05-01', time: '12:00 - 13:00', location: 'Ev' },
  { id: '2', title: 'Deneme', date: '2023-05-01', time: '18:00 - 17:59', location: 'Ofis' },
  { id: '3', title: 'Erenle lol oyna', date: '2023-05-01', time: '18:00 - 19:00', location: 'Ev' },
  { id: '4', title: 'Doktor Randevusu', date: '2023-05-03', time: '14:00 - 15:00', location: 'Hastane' },
  { id: '5', title: 'Toplantı', date: '2023-05-05', time: '10:00 - 11:30', location: 'Ofis' },
];

const pendingTasks: Task[] = [
  { id: '1', title: 'DURUM deneme', dueDate: '26.04.2025', priority: 'low' },
  { id: '2', title: 'Ödevi yap yeni', dueDate: '27.04.2025', priority: 'high' },
  { id: '3', title: 'Ödevi yap', dueDate: '27.04.2025', priority: 'high' },
  { id: '4', title: 'Ödevi yapmak', dueDate: '27.04.2025', priority: 'low' },
  { id: '5', title: 'E-postaları Yanıtla', dueDate: '28.04.2025', priority: 'medium' },
];

// Takvim için işaretli tarihler tipi
interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dotColor?: string;
    dots?: Array<{key?: string; color: string; selectedDotColor?: string}>;
  };
}

// Dashboard navigation prop tipi
type DashboardScreenNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
  const [refreshing, setRefreshing] = useState(false);
  
  // Takvim için işaretli tarihler
  const markedDates: MarkedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    // Bugünün tarihini işaretle
    const today = moment().format('YYYY-MM-DD');
    marked[today] = { 
      selected: today === selectedDate, 
      selectedColor: COLORS.primary,
      marked: true,
      dotColor: COLORS.primary
    };
    
    // Etkinliklerin tarihlerini işaretle
    upcomingEvents.forEach(event => {
      if (marked[event.date]) {
        marked[event.date] = {
          ...marked[event.date],
          marked: true,
          dotColor: COLORS.primary
        };
      } else {
        marked[event.date] = { 
          selected: event.date === selectedDate,
          selectedColor: COLORS.primary,
          marked: true, 
          dotColor: COLORS.primary 
        };
      }
    });
    
    // Seçili tarihi her zaman işaretle
    if (!marked[selectedDate]) {
      marked[selectedDate] = { 
        selected: true, 
        selectedColor: COLORS.primary 
      };
    } else {
      marked[selectedDate] = { 
        ...marked[selectedDate], 
        selected: true, 
        selectedColor: COLORS.primary 
      };
    }
    
    return marked;
  }, [selectedDate, upcomingEvents]);
  
  // Seçili tarihe ait etkinlikler
  const selectedDateEvents = useMemo(() => {
    return upcomingEvents.filter(event => event.date === selectedDate);
  }, [selectedDate]);
  
  // Seçili tarihin Türkçe formatı
  const formattedSelectedDate = useMemo(() => {
    return moment(selectedDate).format('D MMMM YYYY, dddd');
  }, [selectedDate]);
  
  // Yenileme işlemi
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Burada API çağrısı yapılabilir
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);
  
  // Tarih seçildiğinde
  const onDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  }, []);
  
  // Ay değiştiğinde
  const onMonthChange = useCallback((month: { dateString: string }) => {
    setCurrentMonth(month.dateString.substring(0, 7)); // YYYY-MM formatında
  }, []);
  
  // Bugüne git
  const goToToday = useCallback(() => {
    const today = moment().format('YYYY-MM-DD');
    setSelectedDate(today);
    setCurrentMonth(moment().format('YYYY-MM'));
  }, []);
  
  // Görünüm ayarı değiştir
  const changeViewMode = useCallback((mode: 'month' | 'week' | 'day') => {
    setViewMode(mode);
  }, []);
  
  // Drawer'ı açma fonksiyonu
  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);
  
  // Bir etkinlik kartı bileşeni
  const EventCard = useCallback(({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${item.title} etkinliği, ${moment(item.date).format('DD MMMM YYYY')} tarihinde ${item.time} saatlerinde ${item.location} konumunda`}
    >
      <View style={styles.eventDateBox}>
        <Text style={styles.eventMonth}>{moment(item.date).format('MMM')}</Text>
        <Text style={styles.eventDay}>{moment(item.date).format('DD')}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.eventInfoRow}>
          <TimeIcon width={14} height={14} color={COLORS.textMedium} />
          <Text style={styles.eventInfoText}>{item.time}</Text>
        </View>
        <View style={styles.eventInfoRow}>
          <LocationIcon width={14} height={14} color={COLORS.textMedium} />
          <Text style={styles.eventInfoText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), []);
  
  // Bir görev kartı bileşeni
  const TaskCard = useCallback(({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${item.title} görevi, son tarih ${item.dueDate}, ${item.priority === 'high' ? 'yüksek öncelikli' : item.priority === 'medium' ? 'orta öncelikli' : 'düşük öncelikli'}`}
    >
      <View style={[
        styles.taskPriorityIndicator, 
        { backgroundColor: 
          item.priority === 'high' ? COLORS.error : 
          item.priority === 'medium' ? COLORS.warning : 
          COLORS.success 
        }
      ]} />
      <View style={styles.taskDetails}>
        <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.taskInfoRow}>
          <Text style={styles.taskDueDate}>Son Tarih: {item.dueDate}</Text>
          <View style={[
            styles.priorityBadge, 
            { 
              backgroundColor: 
                item.priority === 'high' ? 'rgba(255, 59, 48, 0.1)' : 
                item.priority === 'medium' ? 'rgba(255, 149, 0, 0.1)' : 
                'rgba(52, 199, 89, 0.1)' 
            }
          ]}>
            <Text style={[
              styles.priorityText, 
              {
                color: 
                  item.priority === 'high' ? COLORS.error : 
                  item.priority === 'medium' ? COLORS.warning : 
                  COLORS.success
              }
            ]}>
              {item.priority === 'high' ? 'Yüksek' : 
              item.priority === 'medium' ? 'Orta' : 
              'Düşük'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), []);
  
  // Takvim bileşeni
  const renderCalendar = () => {
    // Haftalık görünüm için
    if (viewMode === 'week') {
      const startDate = moment(selectedDate).startOf('week');
      const endDate = moment(selectedDate).endOf('week');
      
      const weekDays = [];
      let day = startDate.clone();
      
      while (day.isSameOrBefore(endDate)) {
        weekDays.push(day.format('YYYY-MM-DD'));
        day = day.add(1, 'day');
      }
      
      return (
        <View style={styles.weekView}>
          <Text style={styles.calendarHeaderText}>
            {startDate.format('D')} - {endDate.format('D MMMM YYYY')}
          </Text>
          <View style={styles.weekDaysHeader}>
            {weekDays.map((date) => (
              <TouchableOpacity 
                key={date}
                style={[
                  styles.weekDay,
                  date === selectedDate && styles.selectedWeekDay
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={styles.weekDayName}>{moment(date).format('ddd')}</Text>
                <Text style={[
                  styles.weekDayNumber,
                  date === selectedDate && styles.selectedWeekDayText,
                  date === moment().format('YYYY-MM-DD') && styles.todayText
                ]}>
                  {moment(date).format('D')}
                </Text>
                {markedDates[date]?.marked && <View style={styles.weekDayDot} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dayEventsContainer}>
            {selectedDateEvents.length > 0 ? (
              <FlatList
                data={selectedDateEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <EventCard item={item} />}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>Bu tarihte etkinlik bulunmuyor</Text>
              </View>
            )}
          </View>
        </View>
      );
    }
    
    // Günlük görünüm için
    if (viewMode === 'day') {
      return (
        <View style={styles.dayView}>
          <Text style={styles.calendarHeaderText}>
            {moment(selectedDate).format('D MMMM YYYY, dddd')}
          </Text>
          <View style={styles.dayEventsContainer}>
            {selectedDateEvents.length > 0 ? (
              <FlatList
                data={selectedDateEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <EventCard item={item} />}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>Bu tarihte etkinlik bulunmuyor</Text>
              </View>
            )}
          </View>
        </View>
      );
    }
    
    // Aylık görünüm için (varsayılan)
    return (
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        firstDay={1} // Pazartesi
        markedDates={markedDates}
        hideExtraDays={false}
        disableMonthChange={false}
        enableSwipeMonths={true}
        hideArrows={false}
        monthFormat={'MMMM yyyy'}
        renderHeader={(date) => {
          const headerDate = moment(date).format('MMMM YYYY');
          return (
            <Text style={styles.calendarHeaderText}>
              {headerDate.charAt(0).toUpperCase() + headerDate.slice(1)}
            </Text>
          );
        }}
        renderArrow={(direction) => (
          <Text style={styles.calendarArrow}>
            {direction === 'left' ? '←' : '→'}
          </Text>
        )}
        theme={{
          backgroundColor: COLORS.white,
          calendarBackground: COLORS.white,
          textSectionTitleColor: COLORS.textDark,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.textDark,
          textDisabledColor: COLORS.textLight,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.primary,
          indicatorColor: COLORS.primary,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F5F7FA"
        translucent={false}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Başlık Alanı */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={openDrawer} 
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel="Menüyü aç"
          >
            <MenuIcon width={24} height={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ana Sayfa</Text>
            <Text style={styles.headerDate}>{moment().format('D MMMM YYYY, dddd')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.chatButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sohbet başlat"
          >
            <Text style={styles.chatButtonText}>Sohbet</Text>
          </TouchableOpacity>
        </View>
        
        {/* Takvim Alanı */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarControls}>
              <View style={styles.viewToggle}>
                <TouchableOpacity 
                  style={[styles.toggleButton, viewMode === 'month' && styles.activeToggleButton]}
                  onPress={() => changeViewMode('month')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'month' }}
                  accessibilityLabel="Ay görünümü"
                >
                  <Text style={[styles.toggleButtonText, viewMode === 'month' && styles.activeToggleButtonText]}>AY</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, viewMode === 'week' && styles.activeToggleButton]}
                  onPress={() => changeViewMode('week')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'week' }}
                  accessibilityLabel="Hafta görünümü"
                >
                  <Text style={[styles.toggleButtonText, viewMode === 'week' && styles.activeToggleButtonText]}>HAFTA</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, viewMode === 'day' && styles.activeToggleButton]}
                  onPress={() => changeViewMode('day')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'day' }}
                  accessibilityLabel="Gün görünümü"
                >
                  <Text style={[styles.toggleButtonText, viewMode === 'day' && styles.activeToggleButtonText]}>GÜN</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={goToToday}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Bugün'e git"
              >
                <Text style={styles.todayButtonText}>BUGÜN</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {renderCalendar()}
          
          {/* Seçili tarihe ait etkinlikleri göster (Ay görünümünde) */}
          {viewMode === 'month' && selectedDateEvents.length > 0 && (
            <View style={styles.selectedDateEventsContainer}>
              <Text style={styles.selectedDateTitle}>
                {formattedSelectedDate}
              </Text>
              <FlatList
                data={selectedDateEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <EventCard item={item} />}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
        
        {/* Yaklaşan Etkinlikler */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <CalendarIcon width={18} height={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
            </View>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{upcomingEvents.length}</Text>
            </View>
          </View>
          
          <FlatList
            data={upcomingEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard item={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            initialNumToRender={3}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            style={styles.sectionContent}
          />
          
          <TouchableOpacity 
            style={styles.addButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Yeni etkinlik ekle"
          >
            <AddIcon width={16} height={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>Yeni Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Beklenen Görevler */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <CheckIcon width={18} height={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Beklenen Görevler</Text>
            </View>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>{pendingTasks.length}</Text>
            </View>
          </View>
          
          <FlatList
            data={pendingTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskCard item={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            style={styles.sectionContent}
          />
          
          <TouchableOpacity 
            style={styles.addButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Yeni görev ekle"
          >
            <AddIcon width={16} height={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>Yeni Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
    marginTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: SIZES.padding / 2,
  },
  menuButton: {
    padding: SIZES.padding / 2,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h1,
    color: COLORS.textDark,
    fontSize: 20,
  },
  headerDate: {
    ...FONTS.body,
    color: COLORS.textMedium,
    marginTop: 4,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    minWidth: 80,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  chatButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  calendarHeader: {
    marginBottom: SIZES.padding,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    width: '100%',
  },
  viewToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: SIZES.radius,
    padding: 2,
    marginVertical: SIZES.margin,
  },
  toggleButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius - 2,
    minWidth: 60,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    ...FONTS.body,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  activeToggleButtonText: {
    color: COLORS.white,
  },
  todayButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  todayButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  weekView: {
    marginTop: SIZES.margin,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radius,
    padding: 5,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
    marginHorizontal: 2,
    borderRadius: SIZES.radius / 2,
  },
  selectedWeekDay: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  weekDayName: {
    ...FONTS.small,
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  weekDayNumber: {
    ...FONTS.body,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  selectedWeekDayText: {
    color: COLORS.white,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  weekDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  dayView: {
    marginTop: SIZES.margin,
  },
  dayViewTitle: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.margin,
  },
  dayEventsContainer: {
    marginTop: SIZES.margin,
  },
  noEventsContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  noEventsText: {
    ...FONTS.body,
    color: COLORS.textMedium,
  },
  selectedDateEventsContainer: {
    marginTop: SIZES.margin * 1.5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: SIZES.padding,
  },
  selectedDateTitle: {
    ...(FONTS.body || {}),
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.margin,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...FONTS.h2,
    fontSize: 18,
    color: COLORS.textDark,
    marginLeft: SIZES.margin / 2,
  },
  sectionCountBadge: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  sectionCountText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sectionContent: {
    marginBottom: SIZES.padding,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    minHeight: 80,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 0,
  },
  eventDateBox: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 60,
    borderRadius: SIZES.radius / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
    elevation: 1,
  },
  eventMonth: {
    ...FONTS.small,
    color: COLORS.white,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  eventDay: {
    ...FONTS.h2,
    color: COLORS.white,
    fontSize: 20,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    ...(FONTS.body || {}),
    color: COLORS.textDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventInfoText: {
    ...FONTS.small,
    color: COLORS.textMedium,
    marginLeft: 6,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    minHeight: 75,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 0,
  },
  taskPriorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: SIZES.margin,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    ...(FONTS.body || {}),
    color: COLORS.textDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskDueDate: {
    ...FONTS.small,
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  priorityText: {
    ...FONTS.small,
    fontSize: 10,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding / 2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    alignSelf: 'center',
    minWidth: 120,
    minHeight: 44,
    elevation: 1,
  },
  addButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SIZES.margin / 2,
  },
  bottomSpacer: {
    height: 20,
  },
  calendarHeaderText: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  calendarArrow: {
    fontSize: 20,
    color: COLORS.primary,
  },
});

export default DashboardScreen; 