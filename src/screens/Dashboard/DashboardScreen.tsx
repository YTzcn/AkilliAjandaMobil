import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  Platform,
  PanResponder,
  Animated,
  Modal,
  TextInput,
  Switch,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/tr';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { MainDrawerParamList } from '../../navigation/MainNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import ChatDrawer from '../../components/ChatDrawer';
import { observer } from 'mobx-react-lite';
import CalendarStore from '../../store/CalendarStore';
import { Task as TaskType, CreateTaskRequest } from '../../services/TaskService';
import { CalendarEvent } from '../../services/EventService';

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
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

// Etkinlik veri tipi
interface Event extends Omit<CalendarEvent, 'id'> {
  id: number;
  time?: string;
  color?: string;
}

// Görev veri tipi
interface Task extends Omit<TaskType, 'id' | 'priority'> {
  id: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// Dashboard navigation prop tipi
type DashboardScreenNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'Dashboard'>;

// Tarih seçici tipi
type DatePickerMode = 'date' | 'time';

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

// EventCard bileşeni
interface EventCardProps {
  item: Event;
  onPress?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress && onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={[styles.eventCard, { borderLeftColor: item.color || COLORS.primary }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${item.title} etkinliği, ${moment(item.start_date).format('DD MMMM YYYY')} tarihinde ${moment(item.start_date).format('HH:mm')} - ${moment(item.end_date).format('HH:mm')} saatlerinde ${item.location || ''} konumunda`}
    >
      <View style={[styles.eventDateBox, { backgroundColor: item.color || COLORS.primary }]}>
        <Text style={styles.eventMonth}>{moment(item.start_date).format('MMM')}</Text>
        <Text style={styles.eventDay}>{moment(item.start_date).format('D')}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.eventInfoRow}>
          <TimeIcon width={12} height={12} color={COLORS.textMedium} />
          <Text style={styles.eventInfoText}>
            {moment(item.start_date).format('HH:mm')} - {moment(item.end_date).format('HH:mm')}
          </Text>
        </View>
        {item.location && (
          <View style={styles.eventInfoRow}>
            <LocationIcon width={12} height={12} color={COLORS.textMedium} />
            <Text style={styles.eventInfoText}>{item.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// TaskCard bileşeni
interface TaskCardProps {
  item: Task;
  onToggleCompletion?: (isCompleted: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ item, onToggleCompletion }) => {
  const handleToggle = useCallback(() => {
    onToggleCompletion && onToggleCompletion(!item.is_completed);
  }, [item.is_completed, onToggleCompletion]);

  // Öncelik düzeyine göre renk ve metin belirle
  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.textMedium;
    }
  };
  
  const getPriorityText = () => {
    switch (item.priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Normal';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.taskCard}
      activeOpacity={0.7}
      onPress={handleToggle}
    >
      <View style={[styles.taskPriorityIndicator, { backgroundColor: getPriorityColor() }]} />
      <View style={styles.taskDetails}>
        <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.taskInfoRow}>
          <Text style={styles.taskDueDate}>
            Tarih: {moment(item.due_date).format('DD.MM.YYYY')}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor()}20` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {getPriorityText()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// TimeGrid bileşeni
interface TimeGridProps {
  date: string;
  events: Event[];
  onEventPress: (event: Event) => void;
}

const TimeGrid: React.FC<TimeGridProps> = ({ date, events, onEventPress }) => {
  // Saat 08:00'den 20:00'ye kadar saat dilimleri
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Seçili güne ait etkinlikleri filtrele
  const dayEvents = useMemo(() => {
    return events.filter(event => 
      moment(event.start_date).format('YYYY-MM-DD') === date
    );
  }, [date, events]);

  // Etkinlik pozisyonlarını belirle
  const getEventPosition = (event: Event) => {
    const startHour = moment(event.start_date).hour();
    const startMinute = moment(event.start_date).minute();
    const endHour = moment(event.end_date).hour();
    const endMinute = moment(event.end_date).minute();
    
    // Saat 8'den başlayan pozisyonu hesapla (her saat 60 birim)
    const top = (startHour - 8) * 60 + startMinute;
    // Dakika cinsinden süreyi hesapla
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    
    return { top, height: duration };
  };

  return (
    <View style={styles.timeGridContainer}>
      {/* Saat göstergeleri sol sütun */}
      <View style={styles.timeLabelsColumn}>
        {timeSlots.map((time) => (
          <View key={time} style={styles.timeLabel}>
            <Text style={styles.timeLabelText}>{time}</Text>
          </View>
        ))}
      </View>
      
      {/* Sağ tarafta zaman ızgarası ve etkinlikler */}
      <ScrollView 
        style={styles.timeGridScrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeGridContent}>
          {/* Arka plan çizgileri */}
          {timeSlots.map((time, index) => (
            <View key={time} style={[
              styles.timeGridRow,
              { top: index * 60 }
            ]}>
              <View style={styles.timeGridLine} />
            </View>
          ))}
          
          {/* Etkinlik blokları */}
          {dayEvents.map((event) => {
            const position = getEventPosition(event);
            return (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventBlock,
                  {
                    top: position.top,
                    height: Math.max(position.height, 30), // Minimum 30px yükseklik
                    backgroundColor: event.color || COLORS.primary,
                  }
                ]}
                onPress={() => onEventPress(event)}
                activeOpacity={0.8}
              >
                <View style={styles.eventBlockContent}>
                  <Text style={styles.eventBlockTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventBlockTime}>
                    {moment(event.start_date).format('HH:mm')} - {moment(event.end_date).format('HH:mm')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// DashboardScreen bileşeni
const DashboardScreen: React.FC = observer(() => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal durumları
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  
  // Form durumları - Etkinlik
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState(moment().format('DD.MM.YYYY HH:mm'));
  const [eventEndDate, setEventEndDate] = useState(moment().format('DD.MM.YYYY HH:mm'));
  const [eventLocation, setEventLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  
  // Form durumları - Görev
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(moment().format('DD.MM.YYYY HH:mm'));
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskStatus, setTaskStatus] = useState('Bekliyor');
  
  // Tarih seçici durumları
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  
  const calendarStore = useMemo(() => CalendarStore.getInstance(), []);
  
  // API'den veri çekme işlemleri
  const fetchData = useCallback(async () => {
    try {
      const startDate = moment().startOf('month').format('YYYY-MM-DD');
      const endDate = moment().endOf('month').format('YYYY-MM-DD');
      
      await Promise.all([
        calendarStore.fetchEvents(startDate, endDate),
        calendarStore.fetchTasks()
      ]);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  }, [calendarStore]);

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Yenileme işlemi
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // API'den gelen etkinlikleri formatla
  const formattedEvents = useMemo(() => {
    return calendarStore.events.map(event => ({
      ...event,
      time: `${moment(event.start_date).format('HH:mm')} - ${moment(event.end_date).format('HH:mm')}`,
      color: COLORS.primary // Renk ataması için bir mantık eklenebilir
    }));
  }, [calendarStore.events]);

  // API'den gelen görevleri formatla
  const formattedTasks = useMemo(() => {
    return calendarStore.tasks.map(task => {
      let priority: 'low' | 'medium' | 'high';
      switch (task.priority) {
        case 1:
          priority = 'low';
          break;
        case 2:
          priority = 'medium';
          break;
        case 3:
          priority = 'high';
          break;
        default:
          priority = 'medium';
      }

      return {
        ...task,
        priority,
        dueDate: moment(task.due_date).format('DD.MM.YYYY')
      };
    });
  }, [calendarStore.tasks]);

  // Seçili tarihe ait etkinlikleri filtrele
  const selectedDateEvents = useMemo(() => {
    return formattedEvents.filter(event => 
      moment(event.start_date).format('YYYY-MM-DD') === selectedDate
    );
  }, [formattedEvents, selectedDate]);

  // Etkinlik işlemleri
  const handleEventPress = useCallback(async (event: Event) => {
    // Etkinlik detay sayfasına yönlendirme yapılabilir
    console.log('Etkinlik tıklandı:', event);
  }, []);

  // Yeni etkinlik oluşturma
  const handleCreateEvent = useCallback(async () => {
    if (!eventTitle) return;

    try {
      const newEvent = {
        title: eventTitle,
        description: eventDescription,
        start_date: moment(eventStartDate, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
        end_date: moment(eventEndDate, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
        all_day: isAllDay,
        location: eventLocation
      };

      await calendarStore.createEvent(newEvent);
      handleCloseEventModal();
      
      // Başarı mesajı göster
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error);
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu.');
    }
  }, [eventTitle, eventDescription, eventStartDate, eventEndDate, isAllDay, eventLocation, calendarStore]);

  // Yeni görev oluşturma
  const handleCreateTask = useCallback(async () => {
    if (!taskTitle) return;

    try {
      const priority = taskPriority === 'low' ? 1 : taskPriority === 'medium' ? 2 : 3;
      const newTask: CreateTaskRequest = {
        title: taskTitle,
        description: taskDescription,
        due_date: moment(taskDueDate, 'DD.MM.YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
        priority: priority as 1 | 2 | 3,
        status: taskStatus.toLowerCase() as 'pending' | 'in-progress' | 'completed',
        is_completed: taskStatus === 'Tamamlandı'
      };

      await calendarStore.createTask(newTask);
      handleCloseTaskModal();
      
      // Başarı mesajı göster
      Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Görev oluşturma hatası:', error);
      Alert.alert('Hata', 'Görev oluşturulurken bir hata oluştu.');
    }
  }, [taskTitle, taskDescription, taskDueDate, taskPriority, taskStatus, calendarStore]);

  // Görev tamamlama durumunu güncelle
  const handleToggleTaskCompletion = useCallback(async (taskId: number, isCompleted: boolean) => {
    try {
      await calendarStore.toggleTaskCompletion(taskId, isCompleted);
    } catch (error) {
      console.error('Görev durumu güncelleme hatası:', error);
      Alert.alert('Hata', 'Görev durumu güncellenirken bir hata oluştu.');
    }
  }, [calendarStore]);

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
          
          {/* Haftanın günleri başlıkları */}
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
                <Text style={[
                  styles.weekDayName,
                  date === selectedDate && styles.selectedWeekDayText
                ]}>
                  {moment(date).format('ddd')}
                </Text>
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
          
          {/* TimeGrid bileşeni ile günlük görünümü haftalık içinde göster */}
          <TimeGrid 
            date={selectedDate} 
            events={formattedEvents} 
            onEventPress={handleEventPress} 
          />
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
          
          {/* TimeGrid bileşeni ile günlük görünümü göster */}
          <TimeGrid 
            date={selectedDate} 
            events={formattedEvents} 
            onEventPress={handleEventPress} 
          />
        </View>
      );
    }
    
    // Aylık görünüm için (varsayılan)
    return (
      <View style={styles.monthView}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(month) => setCurrentMonth(month.dateString.substring(0, 7))}
          firstDay={1}
          markedDates={markedDates}
          hideExtraDays={false}
          disableMonthChange={false}
          enableSwipeMonths={true}
          hideArrows={false}
          monthFormat={'MMMM yyyy'}
          renderHeader={(date) => {
            const headerDate = moment(date.toString()).format('MMMM YYYY');
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
        
        {/* Seçili günün etkinliklerini hemen altında göster */}
        {selectedDateEvents.length > 0 ? (
          <View style={styles.selectedDateEventsContainer}>
            <Text style={styles.selectedDateTitle}>
              {moment(selectedDate).format('D MMMM YYYY, dddd')}
            </Text>
            <FlatList
              data={selectedDateEvents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <EventCard item={item} onPress={handleEventPress} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>Bu tarihte etkinlik bulunmuyor</Text>
          </View>
        )}
      </View>
    );
  };

  // Tarih seçici işleyicileri - Etkinlik
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate || new Date(eventStartDate);
      setEventStartDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const currentDate = selectedTime || new Date(eventStartDate);
      setEventStartDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate || new Date(eventEndDate);
      setEventEndDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const currentDate = selectedTime || new Date(eventEndDate);
      setEventEndDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  // Tarih seçici işleyicileri - Görev
  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate || new Date(taskDueDate);
      setTaskDueDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  const handleDueTimeChange = (event: any, selectedTime?: Date) => {
    setShowDueTimePicker(false);
    if (selectedTime) {
      const currentDate = selectedTime || new Date(taskDueDate);
      setTaskDueDate(moment(currentDate).format('DD.MM.YYYY HH:mm'));
    }
  };

  // Modal açma/kapama işleyicileri
  const handleOpenEventModal = () => {
    setIsEventModalVisible(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalVisible(false);
    // Form durumlarını sıfırla
    setEventTitle('');
    setEventDescription('');
    setEventStartDate(moment().format('DD.MM.YYYY HH:mm'));
    setEventEndDate(moment().format('DD.MM.YYYY HH:mm'));
    setEventLocation('');
    setIsAllDay(false);
  };

  const handleOpenTaskModal = () => {
    setIsTaskModalVisible(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalVisible(false);
    // Form durumlarını sıfırla
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate(moment().format('DD.MM.YYYY HH:mm'));
    setTaskPriority('medium');
    setTaskStatus('Bekliyor');
  };

  // Etkinlik Ekleme Modalı
  const renderEventModal = () => {
    return (
      <Modal
        visible={isEventModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEventModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseEventModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Yeni Ekle</Text>
                  <TouchableOpacity onPress={handleCloseEventModal} style={styles.closeButton}>
                    <Text style={styles.modalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalTypeSelector}>
                  <TouchableOpacity 
                    style={[styles.typeButton, styles.typeButtonActive]}
                    onPress={() => {}}
                  >
                    <Text style={styles.typeButtonTextActive}>Etkinlik</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.typeButton}
                    onPress={() => {
                      handleCloseEventModal();
                      handleOpenTaskModal();
                    }}
                  >
                    <Text style={styles.typeButtonText}>Görev</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Başlık</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Etkinlik başlığını girin"
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Açıklama</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Etkinlik açıklamasını girin"
                      value={eventDescription}
                      onChangeText={setEventDescription}
                      multiline
                      numberOfLines={4}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>

                  <View style={styles.dateTimeContainer}>
                    <View style={styles.dateTimeGroup}>
                      <Text style={styles.inputLabel}>Başlangıç</Text>
                      <View style={styles.dateTimeInputGroup}>
                        <Pressable 
                          style={styles.dateTimeInput}
                          onPress={() => setShowStartDatePicker(true)}
                        >
                          <Text style={styles.dateTimeText}>
                            {moment(eventStartDate, 'DD.MM.YYYY HH:mm').format('DD.MM.YYYY')}
                          </Text>
                        </Pressable>
                        <Pressable 
                          style={styles.dateTimeInput}
                          onPress={() => setShowStartTimePicker(true)}
                        >
                          <Text style={styles.dateTimeText}>
                            {moment(eventStartDate, 'DD.MM.YYYY HH:mm').format('HH:mm')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.dateTimeGroup}>
                      <Text style={styles.inputLabel}>Bitiş</Text>
                      <View style={styles.dateTimeInputGroup}>
                        <Pressable 
                          style={styles.dateTimeInput}
                          onPress={() => setShowEndDatePicker(true)}
                        >
                          <Text style={styles.dateTimeText}>
                            {moment(eventEndDate, 'DD.MM.YYYY HH:mm').format('DD.MM.YYYY')}
                          </Text>
                        </Pressable>
                        <Pressable 
                          style={styles.dateTimeInput}
                          onPress={() => setShowEndTimePicker(true)}
                        >
                          <Text style={styles.dateTimeText}>
                            {moment(eventEndDate, 'DD.MM.YYYY HH:mm').format('HH:mm')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Konum</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Etkinlik konumunu girin"
                      value={eventLocation}
                      onChangeText={setEventLocation}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Tüm Gün</Text>
                    <Switch
                      value={isAllDay}
                      onValueChange={setIsAllDay}
                      trackColor={{ false: '#767577', true: COLORS.primary }}
                      thumbColor={isAllDay ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </ScrollView>

                {renderEventModalFooter()}

                {/* Tarih ve Saat Seçiciler */}
                {showStartDatePicker && (
                  <DateTimePicker
                    value={moment(eventStartDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
                {showStartTimePicker && (
                  <DateTimePicker
                    value={moment(eventStartDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="time"
                    display="default"
                    onChange={handleStartTimeChange}
                  />
                )}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={moment(eventEndDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
                {showEndTimePicker && (
                  <DateTimePicker
                    value={moment(eventEndDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="time"
                    display="default"
                    onChange={handleEndTimeChange}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Görev Ekleme Modalı
  const renderTaskModal = () => {
    return (
      <Modal
        visible={isTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseTaskModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseTaskModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Yeni Ekle</Text>
                  <TouchableOpacity onPress={handleCloseTaskModal} style={styles.closeButton}>
                    <Text style={styles.modalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalTypeSelector}>
                  <TouchableOpacity 
                    style={styles.typeButton}
                    onPress={() => {
                      handleCloseTaskModal();
                      handleOpenEventModal();
                    }}
                  >
                    <Text style={styles.typeButtonText}>Etkinlik</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.typeButton, styles.typeButtonActive]}
                    onPress={() => {}}
                  >
                    <Text style={styles.typeButtonTextActive}>Görev</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Başlık</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Görev başlığını girin"
                      value={taskTitle}
                      onChangeText={setTaskTitle}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Açıklama</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Görev açıklamasını girin"
                      value={taskDescription}
                      onChangeText={setTaskDescription}
                      multiline
                      numberOfLines={4}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Son Tarih</Text>
                    <View style={styles.dateTimeInputGroup}>
                      <Pressable 
                        style={styles.dateTimeInput}
                        onPress={() => setShowDueDatePicker(true)}
                      >
                        <Text style={styles.dateTimeText}>
                          {moment(taskDueDate, 'DD.MM.YYYY HH:mm').format('DD.MM.YYYY')}
                        </Text>
                      </Pressable>
                      <Pressable 
                        style={styles.dateTimeInput}
                        onPress={() => setShowDueTimePicker(true)}
                      >
                        <Text style={styles.dateTimeText}>
                          {moment(taskDueDate, 'DD.MM.YYYY HH:mm').format('HH:mm')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Öncelik</Text>
                    <View style={styles.priorityButtons}>
                      <TouchableOpacity 
                        style={[
                          styles.priorityButton,
                          taskPriority === 'low' && styles.priorityButtonActive,
                          { backgroundColor: taskPriority === 'low' ? '#4CAF5020' : 'transparent' }
                        ]}
                        onPress={() => setTaskPriority('low')}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          taskPriority === 'low' && { color: '#4CAF50' }
                        ]}>Düşük</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.priorityButton,
                          taskPriority === 'medium' && styles.priorityButtonActive,
                          { backgroundColor: taskPriority === 'medium' ? '#FF980020' : 'transparent' }
                        ]}
                        onPress={() => setTaskPriority('medium')}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          taskPriority === 'medium' && { color: '#FF9800' }
                        ]}>Orta</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.priorityButton,
                          taskPriority === 'high' && styles.priorityButtonActive,
                          { backgroundColor: taskPriority === 'high' ? '#F4433620' : 'transparent' }
                        ]}
                        onPress={() => setTaskPriority('high')}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          taskPriority === 'high' && { color: '#F44336' }
                        ]}>Yüksek</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>Durum</Text>
                    <View style={styles.statusButtons}>
                      <TouchableOpacity 
                        style={[
                          styles.statusButton,
                          taskStatus === 'Bekliyor' && styles.statusButtonActive
                        ]}
                        onPress={() => setTaskStatus('Bekliyor')}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          taskStatus === 'Bekliyor' && styles.statusButtonTextActive
                        ]}>Bekliyor</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.statusButton,
                          taskStatus === 'Devam Ediyor' && styles.statusButtonActive
                        ]}
                        onPress={() => setTaskStatus('Devam Ediyor')}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          taskStatus === 'Devam Ediyor' && styles.statusButtonTextActive
                        ]}>Devam Ediyor</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.statusButton,
                          taskStatus === 'Tamamlandı' && styles.statusButtonActive
                        ]}
                        onPress={() => setTaskStatus('Tamamlandı')}
                      >
                        <Text style={[
                          styles.statusButtonText,
                          taskStatus === 'Tamamlandı' && styles.statusButtonTextActive
                        ]}>Tamamlandı</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                {renderTaskModalFooter()}

                {/* Tarih ve Saat Seçiciler */}
                {showDueDatePicker && (
                  <DateTimePicker
                    value={moment(taskDueDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="date"
                    display="default"
                    onChange={handleDueDateChange}
                  />
                )}
                {showDueTimePicker && (
                  <DateTimePicker
                    value={moment(taskDueDate, 'DD.MM.YYYY HH:mm').toDate()}
                    mode="time"
                    display="default"
                    onChange={handleDueTimeChange}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const [isChatVisible, setIsChatVisible] = useState(false);

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
    formattedEvents.forEach(event => {
      const eventDate = moment(event.start_date).format('YYYY-MM-DD');
      if (marked[eventDate]) {
        marked[eventDate] = {
          ...marked[eventDate],
          marked: true,
          dotColor: COLORS.primary
        };
      } else {
        marked[eventDate] = { 
          selected: eventDate === selectedDate,
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
  }, [selectedDate, formattedEvents]);

  // Drawer'ı açma fonksiyonu
  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  // Görünüm ayarı değiştir
  const changeViewMode = useCallback((mode: 'month' | 'week' | 'day') => {
    setViewMode(mode);
  }, []);

  // Bugüne git
  const goToToday = useCallback(() => {
    const today = moment().format('YYYY-MM-DD');
    setSelectedDate(today);
    setCurrentMonth(moment().format('YYYY-MM'));
  }, []);

  // Modal footer'ları
  const renderEventModalFooter = () => (
    <View style={styles.modalFooter}>
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={handleCloseEventModal}
      >
        <Text style={styles.cancelButtonText}>İptal</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleCreateEvent}
      >
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTaskModalFooter = () => (
    <View style={styles.modalFooter}>
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={handleCloseTaskModal}
      >
        <Text style={styles.cancelButtonText}>İptal</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleCreateTask}
      >
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );

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
            onPress={() => setIsChatVisible(true)}
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
                {moment(selectedDate).format('D MMMM YYYY, dddd')}
              </Text>
              <FlatList
                data={selectedDateEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <EventCard item={item} onPress={handleEventPress} />}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {calendarStore.loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          
          {calendarStore.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{calendarStore.error}</Text>
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
              <Text style={styles.sectionCountText}>{formattedEvents.length}</Text>
            </View>
          </View>
          
          {formattedEvents.length > 0 ? (
            <FlatList
              data={formattedEvents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <EventCard item={item} onPress={handleEventPress} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={styles.sectionContent}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Henüz etkinlik bulunmuyor</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleOpenEventModal}
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
              <Text style={styles.sectionCountText}>{formattedTasks.length}</Text>
            </View>
          </View>
          
          {formattedTasks.length > 0 ? (
            <FlatList
              data={formattedTasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TaskCard 
                  item={item}
                  onToggleCompletion={(isCompleted) => 
                    handleToggleTaskCompletion(item.id, isCompleted)
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={styles.sectionContent}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Henüz görev bulunmuyor</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleOpenTaskModal}
          >
            <AddIcon width={16} height={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>Yeni Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Modalları render et */}
      {renderEventModal()}
      {renderTaskModal()}

      {/* Sohbet çekmecesi */}
      <ChatDrawer 
        isVisible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
      />
    </SafeAreaView>
  );
});

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
  timeGridContainer: {
    flexDirection: 'row',
    height: 600,
    marginTop: SIZES.margin,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: SIZES.radius,
  },
  timeLabelsColumn: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  timeLabel: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  timeLabelText: {
    ...FONTS.small,
    color: COLORS.textMedium,
    fontSize: 12,
  },
  timeGridScrollView: {
    flex: 1,
  },
  timeGridContent: {
    position: 'relative',
    height: 780, // 13 saat * 60 dakika
  },
  timeGridRow: {
    height: 60, // Her saat için 60px yükseklik
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  timeGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  eventBlock: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: SIZES.radius,
    padding: 0,
    minHeight: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  eventBlockContent: {
    padding: 8,
    flex: 1,
    justifyContent: 'center',
  },
  eventBlockTitle: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 2,
  },
  eventBlockTime: {
    ...FONTS.small,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  monthView: {
    flex: 1,
  },
  monthEventItem: {
    padding: SIZES.padding,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  monthEventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthEventIcon: {
    marginRight: SIZES.margin,
  },
  monthEventTime: {
    ...FONTS.small,
    color: COLORS.textMedium,
  },
  monthEventTitle: {
    ...FONTS.body,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  monthEventsScrollView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.textDark,
    fontSize: 20,
  },
  closeButton: {
    padding: SIZES.padding / 2,
  },
  modalCloseButton: {
    fontSize: 24,
    color: COLORS.textMedium,
  },
  modalTypeSelector: {
    flexDirection: 'row',
    padding: SIZES.padding / 2,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: SIZES.radius,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    borderRadius: SIZES.radius - 2,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    ...FONTS.body,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  modalForm: {
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: SIZES.padding,
  },
  inputLabel: {
    ...FONTS.body,
    color: COLORS.textDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...FONTS.body,
    backgroundColor: '#F5F7FA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  dateTimeGroup: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  dateTimeInputGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
  },
  dateTimeText: {
    ...FONTS.body,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    backgroundColor: '#F5F7FA',
    borderRadius: SIZES.radius,
    height: 50,
  },
  switchLabel: {
    ...FONTS.body,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    ...FONTS.body,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: 'transparent',
  },
  statusButtonText: {
    ...FONTS.body,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: SIZES.padding,
  },
  cancelButton: {
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: '#F5F7FA',
  },
  cancelButtonText: {
    ...FONTS.body,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  saveButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  errorContainer: {
    padding: SIZES.padding,
    backgroundColor: '#ffebee',
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
  },
  noDataText: {
    ...FONTS.body,
    color: COLORS.textMedium,
  },
});

export default DashboardScreen; 