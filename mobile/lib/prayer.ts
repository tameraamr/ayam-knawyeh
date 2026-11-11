// Prayer times for Kafr Kanna, computed on the phone (no internet needed) with `adhan`.
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import { formatArabicDate } from './date';

// Kafr Kanna, Lower Galilee
const KAFR_KANNA = new Coordinates(32.7465, 35.342);
const TIME_ZONE = 'Asia/Jerusalem';

// Calculation method + per-prayer corrections in minutes. If the town's mosques
// differ by a minute or two, adjust OFFSETS here (e.g. { maghrib: 3 }).
const OFFSETS: Partial<Record<PrayerKey, number>> = {};

function params() {
  const p = CalculationMethod.MuslimWorldLeague();
  p.adjustments = {
    fajr: OFFSETS.fajr ?? 0,
    sunrise: OFFSETS.sunrise ?? 0,
    dhuhr: OFFSETS.dhuhr ?? 0,
    asr: OFFSETS.asr ?? 0,
    maghrib: OFFSETS.maghrib ?? 0,
    isha: OFFSETS.isha ?? 0,
  };
  return p;
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_NAMES: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export type PrayerTime = { key: PrayerKey; name: string; at: Date; label: string };

/** "4:41 ص" — 12-hour clock with Arabic AM/PM, Western digits, local time of the town. */
export function formatPrayerTime(d: Date): string {
  return formatArabicDate(d, { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TIME_ZONE });
}

export function prayerTimesFor(day: Date): PrayerTime[] {
  const t = new PrayerTimes(KAFR_KANNA, day, params());
  return ORDER.map((key) => {
    const at = t[key] as Date;
    return { key, name: PRAYER_NAMES[key], at, label: formatPrayerTime(at) };
  });
}

/** The next of the five prayers (sunrise is not a prayer); after isha → tomorrow's fajr. */
export function nextPrayer(now = new Date()): PrayerTime {
  const today = prayerTimesFor(now).filter((p) => p.key !== 'sunrise');
  const upcoming = today.find((p) => p.at.getTime() > now.getTime());
  if (upcoming) return upcoming;
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return prayerTimesFor(tomorrow)[0];
}
