/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/AuthNavigator';
import { COLORS } from './src/styles/theme'; // Correctly import from theme

function App(): React.JSX.Element {
  // Set status bar style based on design (assuming light background initially)
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default App;
