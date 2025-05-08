import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import MainNavigator from './MainNavigator'; // Yeni drawer navigator

// Root stack tipini tanımlama
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // MainNavigator için
};

// Ana Navigator için Stack
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator(); // Auth tipi ayrı yönetilebilir veya RootStack'e dahil edilebilir

// Auth Navigator (Login, Register, ForgotPassword)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login" 
      screenOptions={{ 
        headerShown: false,
        animationEnabled: true
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Root Navigator (Auth ve Main akışları arasında geçiş)
const RootNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      {/* Dashboard yerine MainNavigator'ı çağırıyoruz */}
      <RootStack.Screen name="Main" component={MainNavigator} /> 
    </RootStack.Navigator>
  );
};

export default RootNavigator; 