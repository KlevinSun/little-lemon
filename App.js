import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font'
import OnboardingView from './screens/Onboarding'
import Profile from './screens/Profile';
import Home from './screens/Home';

const Stack = createNativeStackNavigator()

const loadFonts = () => {
  return Font.loadAsync({
    'Karla-Regular': require('./assets/fonts/Karla-Regular.ttf'),
    'Karla-Medium': require('./assets/fonts/Karla-Medium.ttf'),
    'Karla-SemiBold': require('./assets/fonts/Karla-SemiBold.ttf'),
    'Karla-Bold': require('./assets/fonts/Karla-Bold.ttf'),
    'Karla-ExtraBold': require('./assets/fonts/Karla-ExtraBold.ttf'),
    'MarkaziText-Regular': require('./assets/fonts/MarkaziText-Regular.ttf'),
    'MarkaziText-Medium': require('./assets/fonts/MarkaziText-Medium.ttf'),
  })
}

export default function App() {
  const [isSignupFinished, setIsSignupFinished] = useState(null)
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async ()=>{
      try {
        const loaded = await loadFonts()
        setFontsLoaded(loaded !== null) 
        const email= await AsyncStorage.getItem('@email')
        const firstName = await AsyncStorage.getItem('@firstName')
        setIsSignupFinished(email !== null && firstName !== null)
        console.log('name:', firstName, "email", email)
      } catch (e) {
        Alert.alert(`An error occurred: ${e.message}`);
      }
    })();
  }, [])

  if (isSignupFinished === null || fontsLoaded === false) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#495E57' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isSignupFinished ? 'Home' : 'OnboardingView'}>
        <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
        <Stack.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name='OnboardingView' component={OnboardingView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});