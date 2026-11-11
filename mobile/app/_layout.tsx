import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerForPushNotifications } from '@/lib/notifications';
import { colors, fonts } from '@/theme';

import * as Updates from 'expo-updates';

// Force RTL (Arabic) in store builds; a reload is needed for it to apply.
// Not in development: Expo Go ignores forceRTL, so reloading there loops forever.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (!__DEV__) {
    Updates.reloadAsync();
  }
}

SplashScreen.preventAutoHideAsync().catch(() => {});


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

  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });
  const ready = fontsLoaded || !!fontError; // on error, fall back to the system font

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    // Audio: expo-video sets the iOS audio session to "playback" itself, so videos
    // are heard even with the silent switch on (what expo-av's audio mode did before).

    registerForPushNotifications().then(token => {
      if (token) console.log('Push token:', token);
    });
  }, []);

  // The navigator always renders (Expo Router needs it mounted, e.g. for notification taps);
  // the splash screen stays up until the fonts are ready.
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Every screen opens with the crimson masthead, so light status-bar text everywhere */}
        <StatusBar style="light" backgroundColor={colors.masthead} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.masthead },
            headerTintColor: colors.onMasthead,
            headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.page },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="article/[id]"
            options={{
              title: '',
              headerBackTitle: 'رجوع',
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
