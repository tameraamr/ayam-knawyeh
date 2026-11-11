import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { registerForPushNotifications } from '@/lib/notifications';

import * as Updates from 'expo-updates';

// Force RTL for Arabic Standalone APKs
// Standalone builds need a reload after forcing RTL to apply correctly
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (!__DEV__) {
    Updates.reloadAsync();
  }
}


// ─── Open the right screen when the user taps a push notification ─────────────
// The backend sends { articleId } for news and { adId } for ads (see backend/src/routes).
let lastHandledNotificationId: string | null = null;

function openFromNotification(response: Notifications.NotificationResponse | null) {
  if (!response) return;
  const id = response.notification.request.identifier;
  if (id === lastHandledNotificationId) return; // don't open the same one twice
  lastHandledNotificationId = id;

  const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
  if (typeof data.articleId === 'string' && data.articleId) {
    router.push(`/article/${data.articleId}`);
  } else if (typeof data.adId === 'string' && data.adId) {
    router.push(`/ad/${data.adId}`);
  }
}

function useNotificationTapHandler() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // App was closed and opened by tapping a notification
    openFromNotification(Notifications.getLastNotificationResponse());
    Notifications.clearLastNotificationResponse();

    // App was open or in the background
    const sub = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  useNotificationTapHandler();

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
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
