import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { api, Article } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { name: 'افراح', icon: 'ribbon', color: '#f97316' }, // Weddings/Joy
  { name: 'مواليد جدد', icon: 'gift', color: '#3b82f6' }, // Newborns
  { name: 'ابناء كفركنا', icon: 'people', color: '#8b5cf6' }, // People of town
  { name: 'اخبار البلد', icon: 'newspaper', color: '#e62020' }, // Town News
  { name: 'يصادف اليوم', icon: 'calendar', color: '#eab308' }, // On this day
  { name: 'محلات تجارية', icon: 'storefront', color: '#ec4899' }, // Stores
  { name: 'تنويهات', icon: 'notifications', color: '#06b6d4' }, // Notices
];

function FadeItem({ children, delay }: { children: React.ReactNode; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 300, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchByCategory = async (category: string) => {
    setSelected(category);
    setLoading(true);
    try {
      const data = await api.getArticles(1, 20, category);
      setArticles(data.articles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Category grid */}
      <View style={styles.grid}>
        {CATEGORIES.map((cat, i) => (
          <FadeItem key={cat.name} delay={i * 50}>
            <TouchableOpacity
              style={[
                styles.catCard,
                { borderColor: selected === cat.name ? cat.color : '#1f2937' },
                selected === cat.name && { backgroundColor: cat.color + '15' },
              ]}
              onPress={() => fetchByCategory(cat.name)}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as never} size={24} color={cat.color} />
              </View>
              <Text style={[styles.catName, selected === cat.name && { color: cat.color }]}>{cat.name}</Text>
            </TouchableOpacity>
          </FadeItem>
        ))}
      </View>

      {/* Results */}
      {selected && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>{selected} ({articles.length})</Text>
          {loading ? (
            <Text style={styles.loadingText}>جارٍ التحميل...</Text>
          ) : articles.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد أخبار في هذا التصنيف</Text>
          ) : (
            <FlatList
              data={articles}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => router.push(`/article/${item._id}`)}
                >
                  <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.resultDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-GB')}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      )}

      {!selected && (
        <View style={styles.hint}>
          <Ionicons name="grid-outline" size={48} color="#374151" />
          <Text style={styles.hintText}>اختر تصنيفاً لعرض الأخبار</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1a' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10, justifyContent: 'center' },
  catCard: { width: 90, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#111827', borderWidth: 1.5, borderColor: '#1f2937' },
  catIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catName: { fontSize: 12, color: '#d1d5db', fontWeight: '600', textAlign: 'center', writingDirection: 'rtl' },
  results: { flex: 1, paddingHorizontal: 16 },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#f9fafb', textAlign: 'right', writingDirection: 'rtl', marginBottom: 12 },
  loadingText: { color: '#6b7280', textAlign: 'center', marginTop: 20 },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 20, fontSize: 14 },
  resultItem: { paddingVertical: 12 },
  resultTitle: { color: '#e5e7eb', fontSize: 14, fontWeight: '600', textAlign: 'right', writingDirection: 'rtl', lineHeight: 20 },
  resultDate: { color: '#6b7280', fontSize: 12, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  separator: { height: 1, backgroundColor: '#1f2937' },
  hint: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hintText: { color: '#4b5563', fontSize: 15, textAlign: 'center' },
});
