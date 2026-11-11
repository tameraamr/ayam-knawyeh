import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Article } from '@/lib/api';
import { formatRelativeDate } from '@/lib/date';
import { colors, radius, spacing, type } from '@/theme';
import { CategoryChip } from './CategoryChip';

/**
 * One news item in a list: text on the right, photo on the left (RTL).
 * Rows are meant to sit inside a white list container separated by hairlines
 * (pass `first` to the first row so it has no top line).
 */
export function ArticleRow({ article, first = false }: { article: Article; first?: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={article.title}
      onPress={() => router.push(`/article/${article._id}`)}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <CategoryChip name={article.category} />
        <Text style={[type.title, styles.fill]} numberOfLines={3}>{article.title}</Text>
        <View style={styles.meta}>
          <Text style={type.meta}>{formatRelativeDate(article.createdAt)}</Text>
          <View style={styles.views}>
            <Ionicons name="eye-outline" size={12} color={colors.soft} />
            <Text style={type.meta}>{article.views}</Text>
          </View>
          {article.videoUrl ? (
            <View style={styles.views}>
              <Ionicons name="play-circle-outline" size={13} color={colors.soft} />
              <Text style={type.meta}>فيديو</Text>
            </View>
          ) : null}
        </View>
      </View>

      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Ionicons name="newspaper-outline" size={24} color={colors.faint} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ms,
    paddingVertical: spacing.ms,
    paddingHorizontal: spacing.ms,
    backgroundColor: colors.surface,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  pressed: { backgroundColor: colors.page },
  text: { flex: 1, gap: 6, alignItems: 'flex-start' },
  fill: { alignSelf: 'stretch' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms },
  views: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  thumb: { width: 96, height: 76, borderRadius: radius.md, backgroundColor: colors.page },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
});
