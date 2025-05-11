import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

interface ErrorMessageProps {
  message: string;
  style?: any;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, style }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.errorLight,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    width: '100%',
  },
  text: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: 'center',
  },
});

export default ErrorMessage; 