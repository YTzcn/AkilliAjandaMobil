import { Dimensions } from 'react-native';

// Renk Paleti (PRD'den)
export const COLORS = {
  primary: '#4158d0',
  secondary: '#357ABD',
  background: '#FFFFFF',
  inputBackground: '#F5F5F5',
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  border: '#E5E5E5',
  white: '#FFFFFF',
  // Add other colors if needed
};

// Tipografi (PRD'den)
export const FONTS = {
  // Önemli: Bu fontların projenize eklenmiş ve linklenmiş olması gerekir.
  // React Native'de özel font ekleme adımlarını takip edin.
  h1: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    lineHeight: 32,
  },
  h2: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    lineHeight: 24,
  },
  h3: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  small: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  error: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  }
  // Add other font styles as needed
};

// Genel Boyutlar ve Aralıklar
const { width, height } = Dimensions.get('window');
export const SIZES = {
  // App Dimensions
  width,
  height,

  // Paddings & Margins
  padding: 16,
  margin: 16,

  // Border Radius
  radius: 8,

  // Component Heights
  inputHeight: 56,
  buttonHeight: 56,

  // Icon Sizes
  icon: 24,
  logoWidth: 120,
  logoHeight: 120,

  // Font Sizes (Referans için, asıl kullanım FONTS objesi üzerinden olmalı)
  h1: 24,
  h2: 18,
  h3: 20,
  h4: 16,
  body: 16,
  small: 14,
  tiny: 12,
};

const appTheme = { COLORS, FONTS, SIZES };

export default appTheme; 