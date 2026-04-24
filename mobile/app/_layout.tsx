import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { registerForPushNotifications } from '@/lib/notifications';

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);


export default function RootLayout() {
  useEffect(() => {
    // Configure audio to play even if the physical silent switch is on (iOS)
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    registerForPushNotifications().then(token => {
      if (token) console.log('Push token:', token);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#0c0101" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0c0101' },
          headerTintColor: '#f9fafb',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0c0101' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="article/[id]"
          options={{
            title: '',
            headerBackTitle: 'رجوع',
            headerStyle: { backgroundColor: '#111827' },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
