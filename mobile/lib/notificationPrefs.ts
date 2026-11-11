// Single source of truth for the user's "notifications on/off" choice,
// shared by the bell on the home screen and the switch in Settings.
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { api } from './api';
import { registerForPushNotifications } from './notifications';

const KEY = 'notificationsEnabled';

export type SaveResult = 'ok' | 'no-permission' | 'error';

/** Notifications are ON by default (no value stored yet). */
export async function getNotificationsPreference(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === null || v === 'true';
  } catch {
    return true;
  }
}

/** Saves the choice and (un)subscribes this device on the backend. */
export async function saveNotificationsPreference(enabled: boolean): Promise<SaveResult> {
  try {
    await AsyncStorage.setItem(KEY, String(enabled));
  } catch {
    // keep going: the backend sync below matters more
  }

  const token = await registerForPushNotifications();
  if (!token) {
    if (!enabled) return 'ok'; // nothing to unsubscribe
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted' ? 'error' : 'no-permission';
    } catch {
      return 'error';
    }
  }

  try {
    await api.togglePushSubscription(token, enabled);
    return 'ok';
  } catch {
    return 'error';
  }
}

/** Shown when the user turns notifications on but the phone's system permission is off. */
export function showNotificationPermissionAlert() {
  Alert.alert(
    'الإشعارات غير مسموحة',
    'لتلقي الأخبار العاجلة، يرجى السماح بالإشعارات لتطبيق ايام كناوية من إعدادات الهاتف.',
    [
      { text: 'لاحقاً', style: 'cancel' },
      { text: 'فتح الإعدادات', onPress: () => Linking.openSettings() },
    ]
  );
}
