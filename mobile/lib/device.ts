// A random, anonymous id for this installation. Used only so the backend can
// count one view per phone per article. It contains no personal data.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'deviceId';
let cached: string | null = null;

function randomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored) return (cached = stored);
    const id = randomId();
    await AsyncStorage.setItem(KEY, id);
    return (cached = id);
  } catch {
    // Storage unavailable: still return an id for this session.
    return (cached = randomId());
  }
}
