import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingView from './screens/Onboarding'
import Profile from './screens/Profile';

const Stack = createNativeStackNavigator()

export default function App() {
  const [isSignupFinished, setIsSignupFinished] = useState(false)

  useEffect(() => {
    (async ()=>{
      try {
        const email= await AsyncStorage.getItem('@email')
        const firstName = await AsyncStorage.getItem('@firstName')
        setIsSignupFinished(email !== null && firstName !== null)
        console.log('name:', firstName, "email", email)
      } catch (e) {
        Alert.alert(`An error occurred: ${e.message}`);
      }
    })();
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isSignupFinished ? (
          <Stack.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name='Onboarding' component={OnboardingView} />
            <Stack.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
          </>
        )}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
