/**
 * Push notifications are NOT supported in Expo Go (SDK 53+).
 * They require a development build: npx expo run:android
 * This file safely no-ops in environments where notifications aren't available.
 */

import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  // Skip entirely in web or if running in Expo Go (no native support)
  if (Platform.OS === 'web') return null;

  try {
    const Device = await import('expo-device');
    const Notifications = await import('expo-notifications');

    if (!Device.default.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    Notifications.default.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } = await Notifications.default.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.default.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.default.setNotificationChannelAsync('default', {
        name: 'ايام كناوية',
        importance: Notifications.default.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e62020',
      });
    }

    const token = await Notifications.default.getDevicePushTokenAsync().catch(() => null);

    return token?.data ?? null;
  } catch (e) {
    // Silently fail in Expo Go — push notifications need a dev build
    console.log('Push notifications unavailable in this environment');
    return null;
  }
}
