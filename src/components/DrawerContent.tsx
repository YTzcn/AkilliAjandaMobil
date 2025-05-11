import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { COLORS, FONTS, SIZES } from '../styles/theme';

// SVG ikonları
import HomeIcon from '../assets/icons/app-icon.svg';
import CalendarIcon from '../assets/icons/calendar.svg';
import CheckIcon from '../assets/icons/check.svg';
import NoteIcon from '../assets/icons/note.svg';
import LogoutIcon from '../assets/icons/logout.svg';
import ProfileIcon from '../assets/icons/profile.svg';

const DrawerContent = (props: any) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Örnek kullanıcı bilgisi - normalde API'den gelecek
  const user = {
    name: 'Adile Nur Yiğit',
    email: 'adilenurygt@gmail.com',
    avatar: 'https://via.placeholder.com/150',
  };

  const handleLogout = () => {
    // Çıkış işlemleri burada yapılacak
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleProfile = () => {
    setIsMenuVisible(false);
    // Profile sayfasına yönlendirme yapılacak
    props.navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Drawer Items */}
        <View style={styles.drawerContent}>
          <DrawerItem
            icon={({ color, size }) => (
              <HomeIcon width={size} height={size} color={color} />
            )}
            label="Ana Sayfa"
            onPress={() => props.navigation.navigate('Dashboard')}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
            activeBackgroundColor={COLORS.primary + '20'}
            activeTintColor={COLORS.primary}
            inactiveTintColor={COLORS.textDark}
          />
         
        </View>
      </DrawerContentScrollView>

      {/* User Profile Section - En altta sabit */}
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => setIsMenuVisible(true)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </TouchableOpacity>

      {/* Profile Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleProfile}
            >
              <ProfileIcon width={20} height={20} color={COLORS.textDark} />
              <Text style={styles.menuItemText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <LogoutIcon width={20} height={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  drawerContent: {
    flex: 1,
    paddingTop: SIZES.padding,
  },
  drawerItem: {
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding / 2,
  },
  drawerLabel: {
    ...FONTS.body,
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.margin,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.h4,
    color: COLORS.textDark,
  },
  userEmail: {
    ...FONTS.small,
    color: COLORS.textMedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  menuItemText: {
    ...FONTS.body,
    marginLeft: SIZES.margin,
    color: COLORS.textDark,
  },
});

export default DrawerContent; 