import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDuration } from '@/lib/date';
import { nextPrayer, prayerTimesFor, type PrayerTime } from '@/lib/prayer';
import { colors, fonts, radius, spacing, type } from '@/theme';

/** Live "next prayer" state, refreshed every 30 seconds. */
function useNextPrayer() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const next = nextPrayer(now);
  return { now, next, minutesLeft: (next.at.getTime() - now.getTime()) / 60000 };
}

/**
 * One line inside the crimson masthead: "الصلاة القادمة: العصر 2:18 م · بعد 35 دقيقة".
 * Tapping opens today's full timetable.
 */
export function PrayerBar() {
  const { now, next, minutesLeft } = useNextPrayer();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`الصلاة القادمة ${next.name} ${next.label}. اضغط لعرض مواقيت اليوم`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.bar, pressed && styles.barPressed]}
      >
        <Ionicons name="moon-outline" size={14} color={colors.onMastheadSoft} />
        <Text style={styles.barText} numberOfLines={1}>
          الصلاة القادمة: <Text style={styles.barStrong}>{next.name} {next.label}</Text>
          {'  ·  '}بعد {formatDuration(minutesLeft)}
        </Text>
        <Ionicons name="chevron-back" size={14} color={colors.onMastheadSoft} />
      </Pressable>

      <PrayerSheet visible={open} onClose={() => setOpen(false)} now={now} next={next} />
    </>
  );
}

function PrayerSheet({ visible, onClose, now, next }: { visible: boolean; onClose: () => void; now: Date; next: PrayerTime }) {
  const insets = useSafeAreaInsets();
  const today = prayerTimesFor(now);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="إغلاق" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <Text style={[type.headline, styles.center]}>مواقيت الصلاة في كفركنا</Text>
        <Text style={[type.meta, styles.center]}>اليوم</Text>

        <View style={styles.list}>
          {today.map((p, i) => {
            const isNext = p.key === next.key && p.at.getTime() === next.at.getTime();
            return (
              <View key={p.key} style={[styles.row, i > 0 && styles.divider, isNext && styles.rowNext]}>
                <Text style={[styles.name, p.key === 'sunrise' && styles.muted, isNext && styles.nextText]}>{p.name}</Text>
                <Text style={[styles.time, p.key === 'sunrise' && styles.muted, isNext && styles.nextText]}>{p.label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={[type.meta, styles.center, styles.note]}>
          محسوبة على الهاتف حسب طريقة رابطة العالم الإسلامي. قد تختلف دقيقة أو دقيقتين عن أذان مساجد البلدة.
        </Text>

        <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.close, pressed && { opacity: 0.85 }]}>
          <Text style={[type.button, { color: colors.white }]}>إغلاق</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  bar: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.ms,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barPressed: { backgroundColor: 'rgba(255,255,255,0.22)' },
  barText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.onMastheadSoft, textAlign: 'right', writingDirection: 'rtl' },
  barStrong: { fontFamily: fonts.semibold, color: colors.onMasthead },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: spacing.md, paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: spacing.sm },
  list: { marginTop: spacing.ms, borderRadius: radius.lg, backgroundColor: colors.page, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, height: 50 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowNext: { backgroundColor: colors.masthead },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  time: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  muted: { color: colors.soft },
  nextText: { color: colors.onMasthead },
  note: { marginTop: spacing.ms, paddingHorizontal: spacing.md, lineHeight: 18 },
  close: {
    marginTop: spacing.md, height: 48, borderRadius: radius.md,
    backgroundColor: colors.masthead, alignItems: 'center', justifyContent: 'center',
  },
});
