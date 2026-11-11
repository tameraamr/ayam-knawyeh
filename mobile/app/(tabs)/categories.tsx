import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api, Article } from '@/lib/api';
import { ArticleRow } from '@/components/ArticleRow';
import { categoryColor, colors, radius, spacing, tint, type, fonts } from '@/theme';
import { CATEGORIES } from '@/lib/categories';

export default function CategoriesScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchByCategory = async (category: string) => {
    setSelected(category);
    setLoading(true);
    setError(false);
    try {
      const data = await api.getArticles(1, 20, category);
      setArticles(data.articles);
    } catch (e) {
      console.error(e);
      setArticles([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <View style={{ gap: spacing.md }}>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const c = categoryColor(cat.name);
          const active = selected === cat.name;
          return (
            <Pressable
              key={cat.name}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => fetchByCategory(cat.name)}
              style={({ pressed }) => [
                styles.tile,
                active && { borderColor: c, backgroundColor: tint(c, '12') },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: tint(c, '1c') }]}>
                <Ionicons name={cat.icon} size={22} color={c} />
              </View>
              <Text style={[styles.tileName, active && { color: c }]} numberOfLines={2}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected && !loading ? (
        <Text style={type.section}>
          {selected} <Text style={type.meta}>({articles.length})</Text>
        </Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={loading ? [] : articles}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={header}
      renderItem={({ item, index }) => (
        <View style={[
          styles.rowWrap,
          index === 0 && styles.rowFirst,
          index === articles.length - 1 && styles.rowLast,
        ]}>
          <ArticleRow article={item} first={index === 0} />
        </View>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator size="large" color={colors.masthead} style={{ marginTop: spacing.xl }} />
        ) : !selected ? (
          <View style={styles.hint}>
            <Ionicons name="grid-outline" size={40} color={colors.faint} />
            <Text style={[type.subhead, styles.center]}>اختر تصنيفاً لعرض أخباره</Text>
          </View>
        ) : error ? (
          <View style={styles.hint}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.faint} />
            <Text style={[type.title, styles.center]}>تعذّر تحميل الأخبار</Text>
            <Pressable onPress={() => fetchByCategory(selected)} hitSlop={8}>
              <Text style={[type.button, { color: colors.masthead }]}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.hint}>
            <Text style={[type.subhead, styles.center]}>لا توجد أخبار في «{selected}» بعد</Text>
          </View>
        )
      }
    />
  );
}

const TILE_GAP = spacing.sm;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  center: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP },
  tile: {
    // 4 per row on phones
    width: '23%', flexGrow: 1,
    alignItems: 'center', gap: 6,
    paddingVertical: spacing.ms, paddingHorizontal: 4,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  tileIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tileName: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.ink, textAlign: 'center' },
  rowWrap: { overflow: 'hidden', backgroundColor: colors.surface },
  rowFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  rowLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  hint: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl * 1.5 },
});
