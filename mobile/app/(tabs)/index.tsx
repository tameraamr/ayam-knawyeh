import {
  View, Text, ScrollView, StyleSheet, Pressable, Image,
  Dimensions, ActivityIndicator, RefreshControl, Platform,
  Animated, Alert, TextInput, Modal, KeyboardAvoidingView, FlatList, I18nManager,
  type NativeSyntheticEvent, type NativeScrollEvent, type StyleProp, type ViewStyle,
} from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Article, Ad } from '@/lib/api';
import {
  getNotificationsPreference,
  saveNotificationsPreference,
  showNotificationPermissionAlert,
} from '@/lib/notificationPrefs';
import { formatRelativeDate, formatArabicDate } from '@/lib/date';
import { colors, fonts, isDark, radius, spacing, type } from '@/theme';
import { setThemePreference } from '@/lib/themePreference';
import { ArticleRow } from '@/components/ArticleRow';
import { CategoryChip } from '@/components/CategoryChip';
import { Footer } from '@/components/Footer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const IS_RTL = I18nManager.isRTL;
const SIDE = spacing.md;                       // screen edge padding
const CARD_WIDTH = SCREEN_WIDTH - SIDE * 2;
const MEDIA_HEIGHT = IS_WEB ? 220 : Math.round(SCREEN_HEIGHT * 0.27);
const CAROUSEL_COUNT = 5;
// The "إعلان" label sits on a white pill over the photo in both themes, so its text stays dark.
const AD_LABEL_INK = '#1f1819';

// ─── Masthead: crimson band with the gold logo, like the front page of a paper ──
function Masthead({
  onSearchPress,
  notificationsEnabled,
  onToggleNotifications,
}: {
  onSearchPress: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}) {
  const insets = useSafeAreaInsets();
  const weekday = formatArabicDate(new Date(), { weekday: 'long' });
  const date = formatArabicDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={[styles.masthead, { paddingTop: insets.top + (IS_WEB ? 12 : 4) }]}>
      <View style={styles.mastRow}>
        {/* Right (RTL start): date */}
        <View style={styles.mastSide}>
          <Text style={styles.mastWeekday}>{weekday}</Text>
          <Text style={styles.mastDate}>{date}</Text>
        </View>

        {/* Centre: logo */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Left (RTL end): actions */}
        <View style={[styles.mastSide, styles.mastActions]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            onPress={() => setThemePreference(isDark ? 'light' : 'dark')}
            hitSlop={6}
            style={({ pressed }) => [styles.mastBtn, styles.mastBtnSmall, pressed && styles.mastBtnPressed]}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={16} color={colors.onMasthead} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
            onPress={onToggleNotifications}
            style={({ pressed }) => [styles.mastBtn, pressed && styles.mastBtnPressed]}
          >
            <Ionicons
              name={notificationsEnabled ? 'notifications' : 'notifications-off-outline'}
              size={19}
              color={colors.onMasthead}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="بحث"
            onPress={onSearchPress}
            style={({ pressed }) => [styles.mastBtn, pressed && styles.mastBtnPressed]}
          >
            <Ionicons name="search" size={19} color={colors.onMasthead} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Section title: text on the right, a hairline filling the rest ─────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={type.section}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ─── Muted looping video (ads and carousel items with a video) ────────────────
function VideoPreview({ uri, height }: { uri: string; height: number }) {
  if (IS_WEB) {
    return (
      // @ts-ignore — plain <video> on web
      <video src={uri} autoPlay loop muted playsInline style={{ width: '100%', height, objectFit: 'cover', display: 'block' }} />
    );
  }
  return <NativeVideoPreview uri={uri} height={height} />;
}

function NativeVideoPreview({ uri, height }: { uri: string; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={{ width: '100%', height }} contentFit="cover" nativeControls={false} />;
}

function VideoBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.videoBadge, style]}>
      <Ionicons name="play" size={11} color={colors.white} />
      <Text style={[type.label, { color: colors.white }]}>فيديو</Text>
    </View>
  );
}

// ─── ① Pinned ad: always first on the page ────────────────────────────────────
function PinnedAdCard({ ad }: { ad: Ad }) {
  const router = useRouter();
  return (
    <View style={[styles.block, styles.padded]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`إعلان: ${ad.title}`}
        onPress={() => router.push(`/ad/${ad._id}` as any)}
        style={({ pressed }) => [styles.mediaCard, pressed && styles.cardPressed]}
      >
        {ad.videoUrl ? (
          <VideoPreview uri={ad.videoUrl} height={MEDIA_HEIGHT} />
        ) : ad.imageUrl ? (
          <Image source={{ uri: ad.imageUrl }} style={styles.media} resizeMode="cover" />
        ) : (
          <View style={[styles.media, styles.mediaEmpty]}>
            <Ionicons name="megaphone-outline" size={40} color={colors.faint} />
          </View>
        )}
        <View style={styles.adLabel}>
          <Ionicons name="megaphone" size={11} color={AD_LABEL_INK} />
          <Text style={[type.label, { color: AD_LABEL_INK }]}>إعلان</Text>
        </View>
        {ad.videoUrl ? <VideoBadge /> : null}
        {ad.title ? (
          <LinearGradient colors={['transparent', colors.overlay]} style={styles.scrim}>
            <Text style={styles.onPhotoTitle} numberOfLines={2}>{ad.title}</Text>
            {ad.description ? <Text style={styles.onPhotoSub} numberOfLines={1}>{ad.description}</Text> : null}
          </LinearGradient>
        ) : null}
      </Pressable>
    </View>
  );
}

// ─── ② Carousel: the 5 latest news, auto-advancing ─────────────────────────────
function FeaturedCarousel({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Article>>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  const start = () => {
    stop();
    if (articles.length <= 1) return;
    timer.current = setInterval(() => {
      const next = (activeIndex + 1) % articles.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, 5000);
  };

  useEffect(() => {
    start();
    return stop;
  }, [activeIndex, articles.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < articles.length) setActiveIndex(index);
  };

  if (articles.length === 0) return null;

  return (
    <View style={styles.block}>
      <View style={styles.padded}><SectionTitle title="أبرز الأخبار" /></View>
      {/* RTL-safe carousel: horizontal lists compute wrong offsets in RTL, so the list
          itself runs LTR and inverted (item 0 on the right, swipe left for the next),
          and each card switches back to RTL. */}
      <FlatList
        ref={listRef}
        data={articles}
        horizontal
        inverted={IS_RTL}
        style={IS_RTL ? { direction: 'ltr' } : undefined}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stop}
        onScrollEndDrag={start}
        keyExtractor={(item) => item._id}
        getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        renderItem={({ item }) => (
          // Cards sit in an LTR list (see above), so their layout is written with
          // physical sides: chip and text on the right, video badge on the left.
          <View style={{ width: SCREEN_WIDTH, paddingHorizontal: SIDE }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.title}
              onPress={() => router.push(`/article/${item._id}`)}
              style={({ pressed }) => [styles.mediaCard, pressed && styles.cardPressed]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.media} resizeMode="cover" />
              ) : (
                <View style={[styles.media, styles.mediaEmpty]}>
                  <Ionicons name="newspaper-outline" size={40} color={colors.faint} />
                </View>
              )}
              {item.videoUrl ? <VideoBadge style={styles.videoBadgeLeft} /> : null}
              <LinearGradient colors={['transparent', colors.overlay]} style={styles.scrim}>
                <CategoryChip name={item.category} onPhoto style={styles.alignRight} />
                <Text style={styles.onPhotoTitle} numberOfLines={2}>{item.title}</Text>
                <View style={[styles.onPhotoMeta, styles.rowFromRight]}>
                  <Text style={styles.onPhotoMetaText}>{formatRelativeDate(item.createdAt)}</Text>
                  <View style={styles.inline}>
                    <Ionicons name="eye-outline" size={12} color={colors.onMastheadSoft} />
                    <Text style={styles.onPhotoMetaText}>{item.views}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      />
      <View style={styles.dots}>
        {articles.map((a, i) => (
          <View key={a._id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Loading placeholder that keeps the page's shape ──────────────────────────
function Skeleton() {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const box = (h: number) => <Animated.View style={[styles.skeleton, { height: h, opacity }]} />;
  return (
    <View style={[styles.padded, { gap: spacing.md, paddingTop: spacing.md }]}>
      {box(MEDIA_HEIGHT)}
      {box(MEDIA_HEIGHT)}
      {box(84)}
      {box(84)}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  // On launch: register this device with the backend if notifications are on.
  useEffect(() => {
    (async () => {
      const isEnabled = await getNotificationsPreference();
      setNotificationsEnabled(isEnabled);
      if (isEnabled) await saveNotificationsPreference(true);
    })();
  }, []);

  // Re-read the preference when coming back to this tab (it may have changed in Settings).
  useFocusEffect(
    useCallback(() => {
      getNotificationsPreference().then(setNotificationsEnabled);
    }, [])
  );

  const handleToggleNotifications = () => {
    Alert.alert(
      'إعدادات الإشعارات',
      notificationsEnabled
        ? 'هل أنت متأكد أنك تريد إيقاف جميع الإشعارات؟'
        : 'هل تريد تفعيل الإشعارات للأخبار العاجلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: notificationsEnabled ? 'إيقاف' : 'تفعيل',
          style: notificationsEnabled ? 'destructive' : 'default',
          onPress: async () => {
            const newState = !notificationsEnabled;
            setNotificationsEnabled(newState);
            const result = await saveNotificationsPreference(newState);
            if (newState && result === 'ok') {
              Alert.alert('تم التفعيل', 'تم تفعيل الإشعارات بنجاح!');
            } else if (newState && result === 'no-permission') {
              showNotificationPermissionAlert();
            }
          },
        },
      ]
    );
  };

  const executeSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await api.getArticles(1, 20, undefined, query);
      setSearchResults(data.articles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [artData, adData] = await Promise.all([api.getArticles(1, 12), api.getAds()]);
      setAllArticles(artData.articles);
      setAds(adData.ads);
      setHasMore(artData.pagination.page < artData.pagination.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); setPage(2); fetchData(); };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await api.getArticles(page, 6);
      setAllArticles(prev => {
        const existingIds = new Set(prev.map(a => a._id));
        return [...prev, ...data.articles.filter(a => !existingIds.has(a._id))];
      });
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setPage(p => p + 1);
    } catch (e) { console.error(e); }
    setLoadingMore(false);
  };

  const pinnedAd = ads.find(a => a.isPinned && a.isActive);
  const carouselArticles = allArticles.slice(0, CAROUSEL_COUNT);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={colors.masthead} />

      {/* Search */}
      <Modal visible={searchVisible} animationType="slide" onRequestClose={() => setSearchVisible(false)}>
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.searchHeader, { paddingTop: insets.top + spacing.sm }]}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={18} color={colors.soft} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن خبر، عائلة، أو مناسبة..."
                placeholderTextColor={colors.faint}
                autoFocus
                returnKeyType="search"
                value={searchQuery}
                onChangeText={executeSearch}
              />
            </View>
            <Pressable onPress={() => setSearchVisible(false)} hitSlop={8} accessibilityRole="button">
              <Text style={[type.button, { color: colors.onMasthead }]}>إلغاء</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.screen} contentContainerStyle={{ padding: SIDE }} keyboardShouldPersistTaps="handled">
            {isSearching ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
            ) : searchResults.length > 0 ? (
              <View style={styles.list}>
                {searchResults.map((a, i) => <ArticleRow key={a._id} article={a} first={i === 0} />)}
              </View>
            ) : searchQuery.length >= 2 ? (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={44} color={colors.faint} />
                <Text style={[type.title, styles.center]}>لا توجد نتائج لـ «{searchQuery}»</Text>
                <Text style={[type.subhead, styles.center]}>جرّب كلمة أخرى أو اسم عائلة</Text>
              </View>
            ) : (
              <Text style={[type.subhead, styles.center, { marginTop: 40 }]}>اكتب حرفين على الأقل للبحث</Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        <Masthead
          onSearchPress={() => setSearchVisible(true)}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
        />

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* ① Pinned ad — always first */}
            {pinnedAd && <PinnedAdCard ad={pinnedAd} />}

            {/* ② Carousel — the 5 latest news */}
            <FeaturedCarousel articles={carouselArticles} />

            {/* ③ All news (including the ones in the carousel) */}
            {allArticles.length > 0 ? (
              <View style={[styles.block, styles.padded]}>
                <SectionTitle title="آخر الأخبار" />
                <View style={styles.list}>
                  {allArticles.map((a, i) => <ArticleRow key={a._id} article={a} first={i === 0} />)}
                </View>

                {hasMore ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                    style={({ pressed }) => [styles.moreBtn, pressed && styles.cardPressed]}
                  >
                    {loadingMore ? (
                      <ActivityIndicator color={colors.accent} />
                    ) : (
                      <>
                        <Text style={[type.button, { color: colors.accent }]}>عرض المزيد من الأخبار</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.accent} />
                      </>
                    )}
                  </Pressable>
                ) : (
                  <Text style={[type.meta, styles.center, { paddingVertical: spacing.md }]}>وصلت إلى نهاية الأخبار</Text>
                )}
              </View>
            ) : !pinnedAd ? (
              <View style={styles.empty}>
                <Ionicons name="newspaper-outline" size={52} color={colors.faint} />
                <Text style={[type.title, styles.center]}>لا توجد أخبار بعد</Text>
                <Text style={[type.subhead, styles.center]}>اسحب للأسفل للتحديث</Text>
              </View>
            ) : null}

            {/* ④ WhatsApp, socials, Powered by */}
            <Footer />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  padded: { paddingHorizontal: SIDE },
  block: { marginTop: spacing.md },
  center: { textAlign: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Masthead
  masthead: {
    backgroundColor: colors.masthead,
    paddingBottom: spacing.ms,
    borderBottomWidth: 3,
    borderBottomColor: colors.goldRule,
  },
  mastRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIDE },
  mastSide: { flex: 1, alignItems: 'flex-start' }, // start = right edge in RTL
  mastActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  mastWeekday: { fontFamily: fonts.semibold, fontSize: 13, color: colors.onMasthead, textAlign: 'auto', writingDirection: 'rtl' },
  mastDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.onMastheadSoft, textAlign: 'auto', writingDirection: 'rtl' },
  logo: { width: 132, height: 84 },
  mastBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  mastBtnSmall: { width: 32, height: 32, borderRadius: 16 },
  mastBtnPressed: { backgroundColor: 'rgba(255,255,255,0.28)' },

  // Section title
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.line },

  // Photo cards (ad + carousel)
  mediaCard: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, marginHorizontal: 0 },
  media: { width: '100%', height: MEDIA_HEIGHT },
  mediaEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.line },
  cardPressed: { opacity: 0.88 },
  scrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.ms,
    gap: 6,
  },
  onPhotoTitle: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 28, color: colors.white, textAlign: 'auto', writingDirection: 'rtl' },
  onPhotoSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.onMastheadSoft, textAlign: 'auto', writingDirection: 'rtl' },
  onPhotoMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms },
  onPhotoMetaText: { fontFamily: fonts.regular, fontSize: 12, color: colors.onMastheadSoft },
  adLabel: {
    position: 'absolute', top: spacing.sm, start: spacing.sm, // reading side: right in RTL
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  videoBadge: {
    position: 'absolute', top: spacing.sm, end: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },

  // Carousel cards (always laid out LTR, see FeaturedCarousel)
  alignRight: { alignSelf: 'flex-end' },
  rowFromRight: { flexDirection: 'row-reverse', alignSelf: 'flex-end' },
  videoBadgeLeft: { start: undefined, end: undefined, left: spacing.sm, right: undefined },

  // Carousel dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: spacing.ms },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotActive: { width: 18, backgroundColor: colors.accent },

  // News list
  list: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  moreBtn: {
    marginTop: spacing.ms, height: 48, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
  },


  // Empty / loading
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl * 1.5, paddingHorizontal: SIDE },
  skeleton: { borderRadius: radius.lg, backgroundColor: colors.line },

  // Search
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.ms,
    paddingHorizontal: SIDE, paddingBottom: spacing.ms,
    backgroundColor: colors.masthead,
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.ms, height: 44,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: fonts.regular, fontSize: 16, color: colors.ink, textAlign: 'auto', writingDirection: 'rtl' },
});
