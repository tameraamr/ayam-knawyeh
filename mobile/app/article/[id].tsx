import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, Image, Platform, Dimensions, Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import { api, Article } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_COLORS: Record<string, string> = {
  'اخبار البلد': '#e62020', 'مواليد جدد': '#3b82f6', 'ابناء كفركنا': '#8b5cf6',
  'افراح': '#f97316', 'يصادف اليوم': '#eab308', 'محلات تجارية': '#ec4899', 'تنويهات': '#06b6d4',
};

const ARTICLE_STYLE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Noto Sans Arabic', sans-serif;
      background: #0a0f1a; color: #e5e7eb;
      font-size: 16px; line-height: 1.9; direction: rtl;
    }
    p { margin-bottom: 14px; }
    h1,h2,h3 { color: #f9fafb; margin-bottom: 10px; line-height: 1.4; }
    h1 { font-size: 21px; } h2 { font-size: 18px; } h3 { font-size: 16px; }
    img { max-width: 100%; border-radius: 10px; margin: 10px 0; display: block; }
    a { color: #e62020; }
    blockquote { border-right: 4px solid #e62020; padding-right: 12px; color: #9ca3af; font-style: italic; margin: 14px 0; }
    ul,ol { padding-right: 22px; margin-bottom: 14px; } li { margin-bottom: 5px; }
    strong { font-weight: 700; color: #f9fafb; }
    code { background: #1f2937; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
  </style>
`;

// Web: render HTML natively in a div
function WebArticleContent({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: ARTICLE_STYLE + html }}
      style={{ direction: 'rtl', color: '#e5e7eb', lineHeight: 1.9 }}
    />
  );
}

// Native: use WebView lazily (only imported on native)
function NativeArticleContent({ html }: { html: string }) {
  const [height, setHeight] = useState(200);
  const { WebView } = require('react-native-webview');
  const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  ${ARTICLE_STYLE}</head><body>${html}
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

function ArticleContent({ html }: { html: string }) {
  if (Platform.OS === 'web') return <WebArticleContent html={html} />;
  return <NativeArticleContent html={html} />;
}

// ── Video player ─────────────────────────────────────────────────────────────────
function VideoPlayer({ uri }: { uri: string }) {
  if (Platform.OS === 'web') {
    return (
      // @ts-ignore
      <video src={uri} controls style={{ width: '100%', maxHeight: 320, backgroundColor: '#000', display: 'block' }} />
    );
  }
  const { Video, ResizeMode } = require('expo-av');
  const { width: W } = Dimensions.get('window');
  return (
    <Video
      source={{ uri }}
      style={{ width: W, height: W * 0.65 }}
      useNativeControls
      resizeMode={ResizeMode.COVER}
    />
  );
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getArticle(id)
      .then(data => {
        setArticle(data.article);
        navigation.setOptions({ title: '' });
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
    if (Platform.OS === 'web') {
      alert("تم الإبلاغ. شكراً لك. سيقوم فريقنا بمراجعة هذا المحتوى قريباً.");
      return;
    }
    Alert.alert(
      "إبلاغ عن محتوى",
      "هل أنت متأكد أنك تريد الإبلاغ عن هذا الخبر كمحتوى مسيء أو غير لائق؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "إبلاغ", 
          style: "destructive",
          onPress: () => {
            Alert.alert("تم الإبلاغ", "شكراً لك. سيقوم فريقنا بمراجعة هذا المحتوى قريباً.");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e62020" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#6b7280" />
        <Text style={styles.errorText}>الخبر غير موجود</Text>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[article.category] || '#6b7280';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
      {/* Cover */}
      {article.videoUrl ? (
        <View style={{ width: '100%' }}>
          <VideoPlayer uri={article.videoUrl} />
        </View>
      ) : article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.cover} resizeMode="cover" />
      ) : null}

      <View style={styles.body}>
        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.catText, { color: categoryColor }]}>{article.category}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(article.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Author + Share + Report */}
        <View style={styles.authorRow}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={20} color="#e62020" />
              <Text style={styles.shareText}>مشاركة</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReport} style={styles.reportBtn}>
              <Ionicons name="flag-outline" size={18} color="#9ca3af" />
              <Text style={styles.reportText}>إبلاغ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.viewsRow}>
              <Ionicons name="eye-outline" size={14} color="#6b7280" />
              <Text style={styles.viewsText}>{article.views}</Text>
            </View>
            <Text style={styles.author}>{article.author}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.desc}>{article.description}</Text>
        <View style={styles.divider} />

        {/* Rich Content */}
        <ArticleContent html={article.content} />

        {/* Tags */}
        {article.tags.length > 0 && (
          <View style={styles.tagsBox}>
            <Text style={styles.tagsLabel}>الوسوم:</Text>
            <View style={styles.tags}>
              {article.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1a' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: '#6b7280', fontSize: 16 },
  cover: { width: '100%', height: 250 },
  body: { padding: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  catText: { fontSize: 12, fontWeight: '700' },
  date: { color: '#6b7280', fontSize: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#f9fafb', lineHeight: 34, textAlign: 'right', marginBottom: 14 },
  authorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  author: { color: '#9ca3af', fontSize: 13 },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { color: '#6b7280', fontSize: 13 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e6202015', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e6202030' },
  shareText: { color: '#e62020', fontSize: 13, fontWeight: '600' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1f2937', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#374151' },
  reportText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  desc: { color: '#d1d5db', fontSize: 15, lineHeight: 26, textAlign: 'right', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#1f2937', marginBottom: 16 },
  tagsBox: { marginTop: 20, padding: 16, backgroundColor: '#111827', borderRadius: 12 },
  tagsLabel: { color: '#6b7280', fontSize: 12, textAlign: 'right', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  tag: { backgroundColor: '#1f2937', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { color: '#9ca3af', fontSize: 12 },
});
