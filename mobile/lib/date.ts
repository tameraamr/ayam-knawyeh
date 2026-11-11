// Arabic date formatting used across the app.
// 'ar-EG-u-nu-latn' = Arabic month/day names with Western digits (1, 2, 3),
// the same format the home banner already uses.
const LOCALE = 'ar-EG-u-nu-latn';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// iOS (Hermes) ignores the "-u-nu-latn" part and returns Arabic-Indic digits (١١).
// Convert them so dates always use 0-9 like the rest of the app.
export function toLatinDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
}

/** Formats with the Arabic locale, always returning Western digits. */
export function formatArabicDate(d: Date, options: Intl.DateTimeFormatOptions): string {
  return toLatinDigits(new Intl.DateTimeFormat(LOCALE, options).format(d));
}

function toDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** "27 أبريل" (adds the year when it isn't the current year). */
export function formatShortDate(value: string | Date): string {
  const d = toDate(value);
  if (!d) return '';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return formatArabicDate(d, {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "27 أبريل 2026" — full date for the article page. */
export function formatFullDate(value: string | Date): string {
  const d = toDate(value);
  if (!d) return '';
  return formatArabicDate(d, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Arabic counting forms: 1 → singular, 2 → dual, 3–10 → plural, 11+ → singular with number.
function arabicCount(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * Relative time for recent news: "الآن", "منذ 5 دقائق", "منذ ساعتين", "أمس", "منذ 3 أيام".
 * After a week it falls back to the short date ("27 أبريل").
 */
export function formatRelativeDate(value: string | Date): string {
  const d = toDate(value);
  if (!d) return '';
  const diff = Date.now() - d.getTime();

  if (diff < 0) return formatShortDate(d); // clock skew / future date
  if (diff < MINUTE) return 'الآن';
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return 'منذ ' + arabicCount(m, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة');
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return 'منذ ' + arabicCount(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
  }
  const days = Math.floor(diff / DAY);
  if (days === 1) return 'أمس';
  if (days < 7) return 'منذ ' + arabicCount(days, 'يوم', 'يومين', 'أيام', 'يوم');
  return formatShortDate(d);
}
