// ─── ايام كناوية — design tokens ("Pietra di Galilea" / حجر الجليل) ───────────
// One source of truth for every screen. Never hardcode colours, font sizes or
// spacing in a screen: add the value here and import it.
//
// Light and dark: the palette is picked ONCE at startup from the phone's setting
// (Appearance). Screens use static StyleSheets, so a change of the phone's mode
// while the app is open applies at the next launch.
import { Appearance, type TextStyle } from 'react-native';
import Storage from 'expo-sqlite/kv-store';

const light = {
  // Surfaces
  page: '#efede8',        // limestone page behind everything
  surface: '#ffffff',     // cards, lists, tab bar
  line: '#ddd7cd',        // hairlines between rows
  // Text
  ink: '#1f1819',         // primary text
  soft: '#6c625e',        // secondary text, meta
  faint: '#9a908b',       // placeholders, disabled
  // Brand
  masthead: '#8c1222',    // crimson band behind the logo, headers, primary buttons
  onMasthead: '#fbf3e4',  // text/icons on the masthead
  onMastheadSoft: '#e9c9b8',
  goldRule: '#c9a24a',    // thin gold line under the masthead
  gold: '#a8822a',        // brand gold on surfaces
  accent: '#8c1222',      // active tab, links, switches, spinners on surfaces
  // Meaning
  urgent: '#a3162a',      // "عاجل" and destructive actions only
  whatsapp: '#1f8f4e',
  overlay: 'rgba(20, 8, 10, 0.78)', // text-on-photo scrim
  white: '#ffffff',
};

const dark: typeof light = {
  page: '#141112',
  surface: '#1e1a1b',
  line: '#322b2c',
  ink: '#f0eae6',
  soft: '#a9a09c',
  faint: '#6f6764',
  masthead: '#6a0f1a',    // deeper crimson so the band doesn't glare at night
  onMasthead: '#fbf3e4',
  onMastheadSoft: '#dcbcab',
  goldRule: '#b8923f',
  gold: '#d4af37',
  accent: '#e2b54c',      // gold reads better than crimson on dark surfaces
  urgent: '#e0566a',
  whatsapp: '#1f8f4e',
  overlay: 'rgba(8, 4, 5, 0.82)',
  white: '#ffffff',
};

// The reader's choice (moon/sun button, Settings): 'system' follows the phone.
// Read synchronously because the palette must be known before any screen's
// StyleSheet is created. Changing it reloads the app (lib/themePreference.ts).
export type ThemePreference = 'system' | 'light' | 'dark';
export const THEME_PREFERENCE_KEY = 'themePreference';

function readThemePreference(): ThemePreference {
  try {
    const v = Storage.getItemSync(THEME_PREFERENCE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export const themePreference = readThemePreference();
if (themePreference !== 'system') {
  // Keeps system UI (alerts, keyboard, date pickers) in the same mode as the app.
  Appearance.setColorScheme(themePreference);
}
export const isDark =
  themePreference === 'system' ? Appearance.getColorScheme() === 'dark' : themePreference === 'dark';
export const colors = isDark ? dark : light;

// One harmonious family for the categories (replaces Tailwind's rainbow).
// Dark variants are lighter so chip text stays readable on dark surfaces.
export const categoryColors: Record<string, string> = isDark
  ? {
      'اخبار البلد': '#ef6b7c',
      'وفيات': '#9aa3ad',
      'تنويهات': '#6fa8c9',
      'ابناء كفركنا': '#d4af37',
      'افراح': '#e58a52',
      'مواليد جدد': '#e08aa8',
      'يصادف اليوم': '#9cbf6e',
      'محلات تجارية': '#b393d6',
    }
  : {
      'اخبار البلد': '#a3162a',
      'وفيات': '#4a5058',       // sober slate for obituaries
      'تنويهات': '#2d5f7a',
      'ابناء كفركنا': '#8a6a1c',
      'افراح': '#b4561d',
      'مواليد جدد': '#a8456a',
      'يصادف اليوم': '#4d6b2f',
      'محلات تجارية': '#6a4a86',
    };
export const categoryColor = (name?: string) => (name && categoryColors[name]) || colors.soft;

/** Tinted background for a category chip (hex + alpha). */
export const tint = (hex: string, alpha = '1f') => `${hex}${alpha}`;

// IBM Plex Sans Arabic, loaded in app/_layout.tsx. Static files: weight comes
// from the family name, so never combine these with fontWeight.
export const fonts = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
} as const;

const rtl: TextStyle = { textAlign: 'right', writingDirection: 'rtl' };

// Type ramp. Sizes are a little larger than before: the audience includes older readers.
export const type = {
  display: { ...rtl, fontFamily: fonts.bold, fontSize: 23, lineHeight: 36, color: colors.ink },
  headline: { ...rtl, fontFamily: fonts.bold, fontSize: 18, lineHeight: 29, color: colors.ink },
  title: { ...rtl, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 24, color: colors.ink },
  section: { ...rtl, fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, color: colors.ink },
  body: { ...rtl, fontFamily: fonts.regular, fontSize: 16, lineHeight: 28, color: colors.ink },
  subhead: { ...rtl, fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: colors.soft },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  meta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.soft },
  button: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
} as const satisfies Record<string, TextStyle>;

export const spacing = { xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 14, full: 9999 } as const;

/** Height of the bottom tab bar content (without the safe-area inset). */
export const TAB_BAR_HEIGHT = 58;
