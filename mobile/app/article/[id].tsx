import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Share, Image, Platform, Dimensions, Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import { api, Article } from '@/lib/api';
import { formatFullDate } from '@/lib/date';
import { Ionicons } from '@expo/vector-icons';
import { CategoryChip } from '@/components/CategoryChip';
import { reportContent } from '@/lib/report';
import { registerArticleReadAndMaybeAskReview } from '@/lib/reviewPrompt';
import { DEFAULT_SCALE_INDEX, TEXT_SCALES, getTextScaleIndex, saveTextScaleIndex } from '@/lib/textSize';
import { colors, fonts, radius, spacing, type } from '@/theme';

// Article body is HTML from the admin editor, rendered in a WebView with the app's look.
// `scale` follows the reader's A−/A+ choice.
const articleStyle = (scale: number) => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Sans Arabic', -apple-system, 'Segoe UI', sans-serif;
      background: ${colors.surface}; color: ${colors.ink};
      font-size: ${Math.round(17 * scale)}px; line-height: 1.9; direction: rtl;
    }
    p { margin-bottom: 14px; }
    h1,h2,h3 { color: ${colors.ink}; margin: 18px 0 10px; line-height: 1.45; font-weight: 700; }
    h1 { font-size: 1.3em; } h2 { font-size: 1.12em; } h3 { font-size: 1em; }
    img { max-width: 100%; border-radius: 10px; margin: 10px 0; display: block; }
    a { color: ${colors.accent}; }
    blockquote { border-right: 4px solid ${colors.goldRule}; padding: 4px 12px 4px 0; color: ${colors.soft}; margin: 14px 0; }
    ul,ol { padding-right: 22px; margin-bottom: 14px; } li { margin-bottom: 6px; }
    strong { font-weight: 700; }
    code { background: ${colors.page}; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
  </style>
`;

// Web: render HTML natively in a div
function WebArticleContent({ html, scale }: { html: string; scale: number }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: articleStyle(scale) + html }}
      style={{ direction: 'rtl', color: colors.ink, lineHeight: 1.9 }}
    />
  );
}

// Native: use WebView lazily (only imported on native)
function NativeArticleContent({ html, scale }: { html: string; scale: number }) {
  const [height, setHeight] = useState(200);
  const { WebView } = require('react-native-webview');
  const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  ${articleStyle(scale)}</head><body>${html}
  <script>
    function updateHeight() {
      window.ReactNativeWebView.postMessage(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    }
    window.addEventListener('load', updateHeight);
    window.addEventListener('resize', updateHeight);
    new MutationObserver(updateHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
    updateHeight();
  </script>
  </body></html>`;
  return (
    <View style={{ height }}>
      <WebView
        source={{ html: fullHtml }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onMessage={(e: any) => {
          const h = parseInt(e.nativeEvent.data);
          if (!isNaN(h) && h > 0) {
            setHeight((prev) => (Math.abs(h - prev) > 5 ? h : prev));
          }
        }}
      />
    </View>
  );
}

function ArticleContent({ html, scale }: { html: string; scale: number }) {
  if (Platform.OS === 'web') return <WebArticleContent html={html} scale={scale} />;
  return <NativeArticleContent html={html} scale={scale} />;
}

// ── A− / A+ in the header ────────────────────────────────────────────────────────
function TextSizeButtons({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const canSmaller = index > 0;
  const canBigger = index < TEXT_SCALES.length - 1;
  return (
    <View style={styles.sizeBtns}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تصغير الخط"
        disabled={!canSmaller}
        hitSlop={6}
        onPress={() => onChange(index - 1)}
        style={({ pressed }) => [styles.sizeBtn, pressed && styles.sizeBtnPressed, !canSmaller && styles.sizeBtnOff]}
      >
        <Text style={[styles.sizeTxt, { fontSize: 14 }]}>أ-</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تكبير الخط"
        disabled={!canBigger}
        hitSlop={6}
        onPress={() => onChange(index + 1)}
        style={({ pressed }) => [styles.sizeBtn, pressed && styles.sizeBtnPressed, !canBigger && styles.sizeBtnOff]}
      >
        <Text style={[styles.sizeTxt, { fontSize: 19 }]}>أ+</Text>
      </Pressable>
    </View>
  );
}

// ── Video player ─────────────────────────────────────────────────────────────────
function VideoPlayer({ uri }: { uri: string }) {
  if (Platform.OS === 'web') {
    return (
      // @ts-ignore
      <video src={uri} controls style={{ width: '100%', maxHeight: 320, backgroundColor: '#000', display: 'block' }} />
    );
  }
  return <NativeVideoPlayer uri={uri} />;
}

// Tap to play, with the system controls (fullscreen, seek) — no autoplay.
function NativeVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  const { width: W } = Dimensions.get('window');
  return (
    <VideoView
      player={player}
      style={{ width: W, height: W * 0.65, backgroundColor: '#000' }}
      contentFit="contain"
      nativeControls
      allowsFullscreen
    />
  );
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_SCALE_INDEX);
  const scale = TEXT_SCALES[scaleIndex];

  // Remembered text size + the A−/A+ buttons in the header.
  useEffect(() => { getTextScaleIndex().then(setScaleIndex); }, []);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TextSizeButtons
          index={scaleIndex}
          onChange={(i) => { setScaleIndex(i); saveTextScaleIndex(i); }}
        />
      ),
    });
  }, [navigation, scaleIndex]);

  useEffect(() => {
    if (!id) return;
    api.getArticle(id)
      .then(data => {
        setArticle(data.article);
        navigation.setOptions({ title: '' });
        api.recordView(id); // once per phone; fire and forget
        registerArticleReadAndMaybeAskReview();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!article) return;
    const shareUrl = `https://ayam-knawyeh.vercel.app/article/${article._id}`;
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.description, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${article.title}\n\n${shareUrl}`);
        alert('تم نسخ الرابط');
      }
    } else {
      await Share.share({ title: article.title, message: `${article.title}\n\n${shareUrl}` });
    }
  };

  const handleReport = () => {
    if (article) reportContent('article', article._id);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.faint} />
        <Text style={[type.title, { textAlign: 'center' }]}>الخبر غير موجود</Text>
        <Text style={[type.subhead, { textAlign: 'center' }]}>ربما تم حذفه. ارجع إلى الصفحة الرئيسية لقراءة آخر الأخبار.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
      {/* Cover */}
      {article.videoUrl ? (
        <View style={{ width: '100%' }}>
          <VideoPlayer uri={article.videoUrl} />
        </View>
      ) : article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.cover} resizeMode="cover" />
      ) : null}

      <View style={styles.body}>
        {/* Category + date */}
        <View style={styles.metaRow}>
          <CategoryChip name={article.category} style={{ alignSelf: 'auto' }} />
          <Text style={type.meta}>{formatFullDate(article.createdAt)}</Text>
        </View>

        <Text style={[type.display, { fontSize: type.display.fontSize * scale, lineHeight: type.display.lineHeight * scale }]}>
          {article.title}
        </Text>

        {/* Author, views */}
        <View style={styles.byline}>
          <Text style={[type.meta, { color: colors.ink, fontFamily: fonts.medium }]}>{article.author}</Text>
          <View style={styles.inline}>
            <Ionicons name="eye-outline" size={13} color={colors.soft} />
            <Text style={type.meta}>{article.views}</Text>
          </View>
        </View>

        {/* Share + report */}
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={handleShare} style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="share-social-outline" size={18} color={colors.white} />
            <Text style={[type.button, { color: colors.white }]}>مشاركة الخبر</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handleReport} style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="flag-outline" size={16} color={colors.soft} />
            <Text style={[type.label, { color: colors.soft }]}>إبلاغ</Text>
          </Pressable>
        </View>

        {/* Description */}
        {article.description && article.description !== article.title ? (
          <Text style={[type.body, styles.desc, { fontSize: type.body.fontSize * scale, lineHeight: type.body.lineHeight * scale }]}>
            {article.description}
          </Text>
        ) : null}
        <View style={styles.divider} />

        {/* Rich Content */}
        <ArticleContent html={article.content} scale={scale} />

        {/* Tags */}
        {article.tags.length > 0 && (
          <View style={styles.tags}>
            {article.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={[type.label, { color: colors.soft }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.page },
  cover: { width: '100%', height: 260, backgroundColor: colors.page },
  body: { padding: spacing.md, gap: spacing.ms },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shareBtn: {
    flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.masthead,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  reportBtn: {
    height: 44, paddingHorizontal: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  desc: { color: colors.soft, fontFamily: fonts.medium },
  sizeBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sizeBtn: {
    minWidth: 38, height: 32, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  sizeBtnPressed: { backgroundColor: 'rgba(255,255,255,0.28)' },
  sizeBtnOff: { opacity: 0.4 },
  sizeTxt: { fontFamily: fonts.bold, color: colors.onMasthead },
  divider: { height: 1, backgroundColor: colors.line },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tag: { backgroundColor: colors.page, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 5 },
});
