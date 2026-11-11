import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image, Switch, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  getNotificationsPreference,
  saveNotificationsPreference,
  getCategoryPreference,
  saveCategoryPreference,
  showNotificationPermissionAlert,
} from '@/lib/notificationPrefs';
import { CATEGORIES } from '@/lib/categories';
import { categoryColor, colors, fonts, radius, spacing, type } from '@/theme';

const FRONTEND_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_FRONTEND_URL || 'http://10.0.2.2:3000')
  : 'https://ayam-knawyeh.vercel.app';
const WHATSAPP_NUMBER = '+972543854441';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Read the real preferences every time this tab is opened (they can change from the home bell).
  useFocusEffect(
    useCallback(() => {
      getNotificationsPreference().then(setNotificationsEnabled);
      getCategoryPreference().then(setCategories);
    }, [])
  );

  const toggleCategory = async (name: string, on: boolean) => {
    const next = on ? [...categories, name] : categories.filter((c) => c !== name);
    if (next.length === 0) {
      Alert.alert('اختر تصنيفاً واحداً على الأقل', 'لإيقاف جميع الإشعارات استخدم زر «إشعارات الأخبار العاجلة» في الأعلى.');
      return;
    }
    setCategories(next);
    setSaving(true);
    const result = await saveCategoryPreference(next);
    setSaving(false);
    if (result === 'no-permission') showNotificationPermissionAlert();
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    setSaving(true);
    const result = await saveNotificationsPreference(value);
    setSaving(false);
    if (value && result === 'no-permission') showNotificationPermissionAlert();
  };

  const openWhatsApp = async () => {
    const app = `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
    const web = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`;
    try {
      if (await Linking.canOpenURL(app)) await Linking.openURL(app);
      else await Linking.openURL(web);
    } catch {
      Linking.openURL(web);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.appHeader}>
        <Image source={require('../../assets/adaptive-icon.png')} style={styles.appIcon} />
        <Text style={[type.headline, styles.center]}>ايام كناوية</Text>
        <Text style={[type.meta, styles.center]}>الإصدار {Constants.expoConfig?.version || '1.0.0'}</Text>
      </View>

      <Section title="الإشعارات">
        <View style={styles.row}>
          <RowLabel
            icon={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'}
            label="إشعارات الأخبار العاجلة"
          />
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={saving}
            trackColor={{ false: colors.line, true: colors.accent }}
            ios_backgroundColor={colors.line}
          />
        </View>
      </Section>

      {notificationsEnabled ? (
        <Section title="ما الذي تريد أن يصلك؟">
          {CATEGORIES.map((cat, i) => (
            <View key={cat.name}>
              {i > 0 ? <Divider /> : null}
              <View style={styles.row}>
                <View style={styles.rowLabel}>
                  <Ionicons name={cat.icon} size={18} color={categoryColor(cat.name)} />
                  <Text style={styles.label}>{cat.name}</Text>
                </View>
                <Switch
                  value={categories.includes(cat.name)}
                  onValueChange={(on) => toggleCategory(cat.name, on)}
                  disabled={saving}
                  trackColor={{ false: colors.line, true: colors.accent }}
                  ios_backgroundColor={colors.line}
                  accessibilityLabel={`إشعارات ${cat.name}`}
                />
              </View>
            </View>
          ))}
        </Section>
      ) : null}

      <Section title="تواصل معنا">
        <Pressable onPress={openWhatsApp} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.rowLabel}>
            <FontAwesome5 name="whatsapp" size={18} color={colors.whatsapp} />
            <Text style={styles.label}>أرسل لنا خبراً عبر واتساب</Text>
          </View>
          <Ionicons name="chevron-back" size={16} color={colors.faint} />
        </Pressable>
        <Divider />
        <LinkRow icon="call-outline" label="اتصل بنا" onPress={() => Linking.openURL(`${FRONTEND_URL}/contact`)} />
      </Section>

      <Section title="عن التطبيق">
        <Text style={[type.subhead, styles.about]}>
          تطبيق ايام كناوية منصة إخبارية لأخبار البلدة، تهدف إلى إيصال آخر الأخبار والمستجدات إلى أبناء كفركنا في أسرع وقت ممكن.
        </Text>
        <Divider />
        <LinkRow icon="shield-checkmark-outline" label="سياسة الخصوصية" onPress={() => Linking.openURL(`${FRONTEND_URL}/privacy`)} />
        <Divider />
        <LinkRow icon="document-text-outline" label="شروط الاستخدام" onPress={() => Linking.openURL(`${FRONTEND_URL}/terms`)} />
      </Section>

      <Text style={[type.meta, styles.center, { marginTop: spacing.sm }]}>
        جميع الحقوق محفوظة © {new Date().getFullYear()} ايام كناوية
      </Text>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function RowLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.rowLabel}>
      <Ionicons name={icon} size={19} color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function LinkRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RowLabel icon={icon} label={label} />
      <Ionicons name="chevron-back" size={16} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { textAlign: 'center' },
  appHeader: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.xs },
  appIcon: { width: 72, height: 72, borderRadius: 18, marginBottom: spacing.xs },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.soft, textAlign: 'right', marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginHorizontal: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52 },
  pressed: { backgroundColor: colors.page },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink, textAlign: 'right' },
  about: { padding: spacing.md },
});
