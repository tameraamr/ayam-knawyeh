// Reader text size for the article page (A− / A+). Remembered on the phone.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'articleTextScale';
export const TEXT_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;
export const DEFAULT_SCALE_INDEX = 1;

export async function getTextScaleIndex(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return DEFAULT_SCALE_INDEX; // nothing saved yet (Number(null) would be 0)
    const v = Number(raw);
    return Number.isInteger(v) && v >= 0 && v < TEXT_SCALES.length ? v : DEFAULT_SCALE_INDEX;
  } catch {
    return DEFAULT_SCALE_INDEX;
  }
}

export async function saveTextScaleIndex(index: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, String(index));
  } catch {
    // not critical
  }
}
