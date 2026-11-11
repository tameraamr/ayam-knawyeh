// Single source of truth for the user's "notifications on/off" choice,
// shared by the bell on the home screen and the switch in Settings.
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { api } from './api';
import { registerForPushNotifications } from './notifications';
import { CATEGORY_NAMES } from './categories';

const KEY = 'notificationsEnabled';
const CATEGORIES_KEY = 'notificationCategories';

export type SaveResult = 'ok' | 'no-permission' | 'error';

/** Categories the user wants notifications for. Default: all of them. */
export async function getCategoryPreference(): Promise<string[]> {
  try {
    const v = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (!v) return [...CATEGORY_NAMES];
    const saved = JSON.parse(v);
    return Array.isArray(saved) ? CATEGORY_NAMES.filter((c) => saved.includes(c)) : [...CATEGORY_NAMES];
  } catch {
    return [...CATEGORY_NAMES];
  }
}

/** What the backend expects: [] when every category is chosen (also covers future categories). */
async function categoriesForBackend(): Promise<string[]> {
  const chosen = await getCategoryPreference();
  return chosen.length === CATEGORY_NAMES.length ? [] : chosen;
}

/** Saves the chosen categories and updates this device's subscription. */
export async function saveCategoryPreference(categories: string[]): Promise<SaveResult> {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // keep going
  }
  return saveNotificationsPreference(true);
}

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
    await api.togglePushSubscription(token, enabled, enabled ? await categoriesForBackend() : undefined);
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
