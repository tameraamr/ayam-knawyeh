import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SOCIALS, openAppOrWeb, openWhatsApp } from '@/lib/links';
import { colors, radius, spacing, type } from '@/theme';

/** Bottom of the home and article pages: WhatsApp, socials, credits. */
export function Footer() {
  return (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole="button"
        onPress={openWhatsApp}
        style={({ pressed }) => [styles.whatsapp, pressed && { opacity: 0.85 }]}
      >
        <FontAwesome5 name="whatsapp" size={20} color={colors.white} />
        <Text style={[type.button, { color: colors.white }]}>أرسل لنا خبراً عبر واتساب</Text>
      </Pressable>

      <View style={styles.socialRow}>
        {SOCIALS.map((s) => (
          <Pressable
            key={s.label}
            accessibilityRole="link"
            accessibilityLabel={s.label}
            onPress={() => openAppOrWeb(s.app, s.web)}
            style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.85 }]}
          >
            <FontAwesome5 name={s.icon} size={15} color={colors.accent} />
            <Text style={[type.label, { color: colors.ink }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[type.meta, styles.center]}>© {new Date().getFullYear()} أيام كناوية · جميع الحقوق محفوظة</Text>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://tamer-omar.com')} hitSlop={8}>
        <Text style={[styles.powered, styles.center]}>
          Powered by <Text style={styles.poweredName}>Tamer Omar</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  footer: { marginTop: spacing.xl, gap: spacing.ms, alignItems: 'stretch', paddingHorizontal: spacing.md },
  whatsapp: {
    height: 52, borderRadius: radius.md, backgroundColor: colors.whatsapp,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialBtn: {
    flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.line,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  powered: { fontFamily: Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' }), fontSize: 12, color: colors.soft },
  poweredName: { color: colors.accent, fontWeight: '700' },
});
