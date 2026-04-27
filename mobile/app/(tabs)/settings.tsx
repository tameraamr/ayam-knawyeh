import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || 'http://10.0.2.2:3000'; // Change to your domain in production

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.appIcon}>
          <Image source={require('../../assets/adaptive-icon.png')} style={{ width: 60, height: 60, borderRadius: 12 }} />
        </View>
        <Text style={styles.appName}>ايام كناوية</Text>
        <Text style={styles.appVersion}>الإصدار {Constants.expoConfig?.version || '1.0.0'}</Text>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات</Text>
        <View style={styles.card}>
          <Row icon="server-outline" label="عنوان الخادم" value={API_BASE} mono />
          <View style={styles.divider} />
          <Row icon="notifications-outline" label="الإشعارات" value="مفعّل" />
          <View style={styles.divider} />
          <Row icon="globe-outline" label="اللغة" value="العربية" />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عن التطبيق</Text>
        <View style={styles.card}>
          <Text style={styles.about}>
            تطبيق ايام كناوية هو منصة إخبارية اخبار البلدة تهدف إلى إيصال آخر الأخبار والمستجدات إلى أبناء المنطقة في أسرع وقت ممكن.
          </Text>
        </View>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>القانونية</Text>
        <View style={styles.card}>
          <ClickableRow icon="shield-checkmark-outline" label="سياسة الخصوصية" onPress={() => Linking.openURL(`${FRONTEND_URL}/privacy`)} />
          <View style={styles.divider} />
          <ClickableRow icon="document-text-outline" label="شروط الاستخدام" onPress={() => Linking.openURL(`${FRONTEND_URL}/terms`)} />
        </View>
      </View>

      <Text style={styles.footer}>جميع الحقوق محفوظة © 2025 ايام كناوية</Text>
    </ScrollView>
  );
}

function ClickableRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name="chevron-back" size={16} color="#4b5563" />
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Ionicons name={icon as never} size={18} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
}

function Row({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>{value}</Text>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Ionicons name={icon as never} size={18} color="#6b7280" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1a' },
  content: { padding: 16, paddingBottom: 100 },
  appHeader: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  appIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: '#e6202015', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e6202030',
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#f9fafb', textAlign: 'right', writingDirection: 'rtl' },
  appVersion: { fontSize: 13, color: '#6b7280', textAlign: 'right', writingDirection: 'rtl' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'right', writingDirection: 'rtl', marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', padding: 4 },
  divider: { height: 1, backgroundColor: '#1f2937', marginHorizontal: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { color: '#d1d5db', fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  rowValue: { color: '#6b7280', fontSize: 13, maxWidth: '55%', textAlign: 'right', writingDirection: 'rtl' },
  mono: { fontFamily: 'monospace', fontSize: 11, color: '#4b5563' },
  about: { color: '#9ca3af', fontSize: 14, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl', padding: 14 },
  footer: { color: '#374151', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
