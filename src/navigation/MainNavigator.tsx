import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CalendarSyncScreen from '../screens/Settings/CalendarSyncScreen';
import DrawerContent from '../components/DrawerContent';

// Drawer tipini tanımlama
export type MainDrawerParamList = {
  Dashboard: undefined;
  Profile: undefined;
  CalendarSync: undefined;
  // Buraya diğer ana ekranlar eklenebilir (örn: Ayarlar)
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Ana navigasyon bileşeni
const MainNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false, // Header'ı Dashboard içinde yöneteceğiz
        drawerPosition: 'left', 
        drawerType: 'front', // veya 'slide', 'back'
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerStyle: {
          width: '80%',
          maxWidth: 400,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Ana Sayfa' }} 
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <Drawer.Screen
        name="CalendarSync"
        component={CalendarSyncScreen}
        options={{ title: 'Takvim Senkronizasyonu' }}
      />
      {/* Başka ekranlar buraya eklenebilir */}
      {/* <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} /> */}
    </Drawer.Navigator>
  );
};

export default MainNavigator; 