// Switch between light / dark / follow-the-phone. The palette is fixed at startup
// (see theme/index.ts), so the app reloads to apply the new one — a brief flash.
import { DevSettings } from 'react-native';
import * as Updates from 'expo-updates';
import Storage from 'expo-sqlite/kv-store';
import { THEME_PREFERENCE_KEY, themePreference, type ThemePreference } from '@/theme';

export function setThemePreference(next: ThemePreference) {
  if (next === themePreference) return;
  try {
    Storage.setItemSync(THEME_PREFERENCE_KEY, next);
  } catch {
    return; // storage unavailable: keep the current theme
  }
  if (__DEV__) DevSettings.reload();
  else Updates.reloadAsync().catch(() => DevSettings.reload());
}
