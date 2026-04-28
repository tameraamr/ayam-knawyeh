import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  Dimensions, StatusBar, Linking, ActivityIndicator,
  RefreshControl, Platform, Animated, PanResponder, Pressable,
  Alert, TextInput, Modal, SafeAreaView, KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, Article, Ad } from '@/lib/api';
import { registerForPushNotifications } from '@/lib/notifications';

// Simple fade-in wrapper using built-in Animated
function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

const { width: W, height: H } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg: '#0c0101',
  surface: '#180505',
  card: '#1e0808',
  cardBorder: '#3a1010',
  red: '#c8102e',
  redDark: '#8b0000',
  redLight: '#e63d3d',
  gold: '#d4af37',
  goldLight: '#f0d060',
  goldDark: '#a07c10',
  textPrimary: '#f5ede0',
  textSecondary: '#a08878',
  textMuted: '#5a3a3a',
};

// ─── Shimmer / Pulse for loading ─────────────────────────────────────────────
function PulseCard({ h = 200 }: { h?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ height: h, borderRadius: 20, backgroundColor: C.card, marginHorizontal: 16, marginBottom: 14, opacity }} />
  );
}

// ─── Banner Header (Modern Layout) ─────────────────────────────────────────────
function HeroBanner({
  onSearchPress,
  notificationsEnabled,
  onToggleNotifications
}: {
  onSearchPress: () => void,
  notificationsEnabled: boolean,
  onToggleNotifications: () => void
}) {
  // ar-EG-u-nu-latn forces international numbers (1, 2, 3) but keeps Arabic language (أبريل, الخميس)
  const dateStr = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <FadeIn delay={0}>
      <View style={styles.modernBanner}>
        <View style={styles.bannerRow}>

          {/* Right: Date (Standard Arabic Right-Side) */}
          <View style={styles.bannerRight}>
            <Text style={styles.bannerDateText}>{dateStr.replace('،', '\n')}</Text>
          </View>

          {/* Center: Huge Logo */}
          <View style={styles.bannerCenter}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.modernLogo}
              resizeMode="contain"
            />
          </View>

          {/* Left: Actions (Standard Arabic Left-Side) */}
          <View style={styles.bannerLeft}>
            <TouchableOpacity style={styles.bannerLeftBtn} activeOpacity={0.7} onPress={onToggleNotifications}>
              <Ionicons name={notificationsEnabled ? "notifications" : "notifications-off"} size={20} color={notificationsEnabled ? C.goldLight : C.textMuted} />
              {notificationsEnabled && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.bannerLeftBtn} activeOpacity={0.7} onPress={onSearchPress}>
              <Ionicons name="search" size={20} color={C.textPrimary} />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </FadeIn>
  );
}

const openSocialLink = async (appUrl: string, webUrl: string) => {
  try {
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      await Linking.openURL(appUrl);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    Linking.openURL(webUrl);
  }
};

// ─── Social Footer ─────────────────────────────────────────────────────
function SocialFooter() {
  return (
    <View style={styles.footer}>
      <LinearGradient
        colors={['transparent', C.gold + '40', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: 1, marginBottom: 16 }}
      />
      <View style={styles.footerSocial}>
        <TouchableOpacity style={styles.footerBtn} onPress={() => openSocialLink('fb://facewebmodal/f?href=https://facebook.com/kanna.days2', 'https://facebook.com/kanna.days2')}>
          <FontAwesome5 name="facebook-f" size={14} color={C.gold} />
          <Text style={styles.footerBtnLabel}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => openSocialLink('instagram://user?username=ayam.knawyeh', 'https://instagram.com/ayam.knawyeh')}>
          <FontAwesome5 name="instagram" size={14} color={C.gold} />
          <Text style={styles.footerBtnLabel}>Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => openSocialLink('tiktok://@aeamknaweah', 'https://tiktok.com/@aeamknaweah')}>
          <FontAwesome5 name="tiktok" size={13} color={C.gold} />
          <Text style={styles.footerBtnLabel}>TikTok</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerCopy}>© 2025 أيام كناوية — جميع الحقوق محفوظة</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://tamer-omar.com')} style={styles.poweredByBtn}>
        <Text style={styles.poweredByText}>
          Powered by <Text style={{ color: C.gold, fontWeight: 'bold' }}>Tamer Omar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Media badge (video or image) ─────────────────────────────────────────────
function MediaBadge({ hasVideo }: { hasVideo: boolean }) {
  if (!hasVideo) return null;
  return (
    <View style={styles.videoBadge}>
      <Ionicons name="play-circle" size={12} color="#fff" />
      <Text style={styles.videoBadgeText}>فيديو</Text>
    </View>
  );
}

// ─── Video Preview ────────────────────────────────────────────────────────────
function VideoPreview({ uri }: { uri: string }) {
  if (IS_WEB) {
    return (
      // @ts-ignore
      <video src={uri} autoPlay loop muted playsInline style={{ width: '100%', height: IS_WEB ? 200 : H * 0.27, objectFit: 'cover', display: 'block' }} />
    );
  }
  const { Video, ResizeMode } = require('expo-av');
  return (
    <Video
      source={{ uri }}
      style={{ width: '100%', height: H * 0.27 }}
      resizeMode={ResizeMode.COVER}
      shouldPlay
      isLooping
      isMuted
    />
  );
}

// ─── Animated Card Wrapper ───────────────────────────────────────────────────
function AnimatedCard({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        style,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : 1,
        }
      ]}
    >
      {children}
    </Pressable>
  );
}

// ─── Pinned Ad Card ────────────────────────────────────────────────────────────
function PinnedAdCard({ ad }: { ad: Ad }) {
  const router = useRouter();

  return (
    <FadeIn delay={100} style={styles.pinnedAdWrap}>
      {/* Label */}
      <View style={styles.sectionLabelRow}>
        <LinearGradient colors={[C.red, C.redLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionLabelBar} />
        <View style={styles.adPill}>
          <Ionicons name="megaphone" size={11} color={C.gold} />
          <Text style={styles.adPillText}>إعلان مميز</Text>
        </View>
      </View>

      <AnimatedCard style={styles.adCard} onPress={() => router.push(`/ad/${ad._id}` as any)}>
        {/* Media */}
        <View style={styles.adImageWrap}>
          {ad.videoUrl ? (
            <VideoPreview uri={ad.videoUrl} />
          ) : ad.imageUrl ? (
            <Image source={{ uri: ad.imageUrl }} style={styles.adImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[C.redDark, C.card]} style={styles.adImagePlaceholder}>
              <Ionicons name="megaphone" size={42} color={C.redLight} />
            </LinearGradient>
          )}
          <MediaBadge hasVideo={!!ad.videoUrl} />
          <LinearGradient
            colors={['transparent', 'rgba(10,0,0,0.6)', 'rgba(10,0,0,0.95)']}
            style={styles.adOverlay}
          />
          <View style={styles.adOverlayContent}>
            <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
            {ad.description ? (
              <Text style={styles.adDesc} numberOfLines={2}>{ad.description}</Text>
            ) : null}
          </View>
        </View>
      </AnimatedCard>
    </FadeIn>
  );
}

// ─── Featured Article (latest, hero style) ────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'اخبار البلد': '#e62020', 'مواليد جدد': '#0ea5e9', 'ابناء كفركنا': '#8b5cf6',
  'افراح': '#f97316', 'يصادف اليوم': '#eab308', 'محلات تجارية': '#ec4899', 'تنويهات': '#06b6d4',
};

function FeaturedSlider({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<any>(null);

  const startAutoScroll = () => {
    stopAutoScroll();
    if (articles.length <= 1) return;
    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % articles.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [activeIndex, articles.length]);

  const onScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (articles.length === 0) return null;

  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sectionLabelRow}>
        <LinearGradient colors={[C.gold, C.goldLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionLabelBar} />
        <View style={[styles.adPill, { backgroundColor: C.gold + '22', borderColor: C.gold + '44' }]}>
          <Ionicons name="star" size={11} color={C.gold} />
          <Text style={[styles.adPillText, { color: C.gold }]}>أبرز الأخبار</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={articles}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
        keyExtractor={(item) => item._id}
        renderItem={({ item }: { item: Article }) => {
          const catColor = CAT_COLORS[item.category] || C.red;
          return (
            <View style={{ width: SCREEN_WIDTH }}>
              <AnimatedCard onPress={() => router.push(`/article/${item._id}`)}>
                <View style={styles.featuredCard}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={[C.redDark, C.card]} style={styles.featuredImagePlaceholder}>
                      <Ionicons name="newspaper" size={48} color={C.redLight} />
                    </LinearGradient>
                  )}
                  <MediaBadge hasVideo={!!item.videoUrl} />
                  <LinearGradient
                    colors={['transparent', 'rgba(10,0,0,0.5)', 'rgba(10,0,0,0.97)']}
                    style={styles.featuredOverlay}
                  />
                  <View style={styles.featuredContent}>
                    <View style={[styles.catBadge, { backgroundColor: catColor + '25', borderColor: catColor + '60' }]}>
                      <Text style={[styles.catBadgeText, { color: catColor }]}>{item.category}</Text>
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.featuredDesc} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.metaLeft}>
                        <Ionicons name="eye-outline" size={13} color={C.textSecondary} />
                        <Text style={styles.metaText}>{item.views}</Text>
                      </View>
                      <Text style={styles.metaDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </View>
              </AnimatedCard>
            </View>
          );
        }}
      />

      <View style={styles.dotsRow}>
        {articles.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Compact Article Row ────────────────────────────────────────────────────────
function ArticleRow({ article, index }: { article: Article; index: number }) {
  const router = useRouter();
  const catColor = CAT_COLORS[article.category] || C.red;

  return (
    <FadeIn delay={index * 60}>
      <AnimatedCard
        style={styles.articleRow}
        onPress={() => router.push(`/article/${article._id}`)}
      >
        {/* Text section (Primary on Right in RTL) */}
        <View style={styles.articleText}>
          <View style={[styles.catBadgeSmall, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.catBadgeSmallText, { color: catColor }]}>{article.category}</Text>
          </View>
          <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
          <View style={styles.articleMeta}>
            <Ionicons name="time-outline" size={11} color={C.textMuted} />
            <Text style={styles.articleMetaText}>
              {new Date(article.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
            </Text>
            <Ionicons name="eye-outline" size={11} color={C.textMuted} style={{ marginStart: 8 }} />
            <Text style={styles.articleMetaText}>{article.views}</Text>
          </View>
        </View>

        {/* Thumbnail (Secondary on Left in RTL) */}
        <View style={styles.thumbWrap}>
          {article.imageUrl ? (
            <Image source={{ uri: article.imageUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[C.redDark, C.card]} style={styles.thumbPlaceholder}>
              <Ionicons name="newspaper-outline" size={22} color={C.textMuted} />
            </LinearGradient>
          )}
          <MediaBadge hasVideo={!!article.videoUrl} />
          <View style={[styles.thumbCatDot, { backgroundColor: catColor }]} />
        </View>

        {/* Arrow (Far Left) */}
        <Ionicons name="chevron-back" size={16} color={C.textMuted} />
      </AnimatedCard>
    </FadeIn>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={[C.red, 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.sectionLine}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
      <LinearGradient
        colors={['transparent', C.red]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.sectionLine}
      />
    </View>
  );
}

// ─── Load More Button ──────────────────────────────────────────────────────────
function LoadMoreButton({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.seeAllWrap}>
      <LinearGradient
        colors={[C.redDark, C.red, C.redLight]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.seeAllBtn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.seeAllText}>عرض المزيد</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Draggable WhatsApp ─────────────────────────────────────────────────────────
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function DraggableWhatsApp() {
  const [visible, setVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const insets = useSafeAreaInsets();

  const fabBottom = Platform.OS === 'android'
    ? 16 + 64 + insets.bottom  // 64 = tab bar height, insets.bottom = nav bar height
    : 90;  // keep iOS value unchanged

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // Only trigger drag if moved more than 5 pixels (allows normal taps to work)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        setIsDragging(false);

        // Check if dragged to the bottom center dropzone
        if (gesture.moveY > SCREEN_HEIGHT - 160 && gesture.moveX > SCREEN_WIDTH / 2 - 80 && gesture.moveX < SCREEN_WIDTH / 2 + 80) {
          // Snap down and hide
          Animated.timing(pan, { toValue: { x: gesture.dx, y: gesture.dy + 200 }, duration: 250, useNativeDriver: false }).start(() => setVisible(false));
        } else {
          // Snap back to origin perfectly
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 5 }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <>
      {isDragging && (
        <FadeIn delay={0}>
          <View style={styles.dropZone}>
            <View style={styles.dropZoneInner}>
              <Ionicons name="close" size={28} color="#fff" />
            </View>
            <Text style={styles.dropZoneText}>اسحب هنا للإخفاء</Text>
          </View>
        </FadeIn>
      )}
      <Animated.View
        style={[
          styles.whatsappContainer,
          { bottom: fabBottom },
          { transform: pan.getTranslateTransform() }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.fabWhatsApp} activeOpacity={0.8} onPress={() => Linking.openURL('whatsapp://send?phone=+972543854441')}>
          <FontAwesome5 name="whatsapp" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);

  // Search & Notifications State
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const setupNotifications = async () => {
      const val = await AsyncStorage.getItem('notificationsEnabled');
      const isEnabled = val === null || val === 'true';
      setNotificationsEnabled(isEnabled);

      if (isEnabled) {
        const token = await registerForPushNotifications();
        if (token) {
          try {
            await api.togglePushSubscription(token, true);
          } catch (e) {
            console.log('Push subscription sync skipped');
          }
        }
      }
    };
    setupNotifications();
  }, []);

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
            await AsyncStorage.setItem('notificationsEnabled', newState.toString());

            const token = await registerForPushNotifications();
            if (token) {
              try {
                await api.togglePushSubscription(token, newState);
                if (newState) {
                  Alert.alert('تم التفعيل', 'تم تفعيل الإشعارات بنجاح!');
                }
              } catch (e) {
                console.log('Push subscription sync skipped');
              }
            }
          }
        }
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

  const fetchData = useCallback(async (reset = false) => {
    try {
      const [artData, adData] = await Promise.all([
        api.getArticles(1, 12),
        api.getAds(),
      ]);
      setAllArticles(artData.articles);
      setArticles(artData.articles);
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

  const handleRefresh = () => { setRefreshing(true); setPage(2); fetchData(true); };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await api.getArticles(page, 6);
      setAllArticles(prev => {
        // Filter out any duplicates just in case
        const existingIds = new Set(prev.map(a => a._id));
        const newArticles = data.articles.filter(a => !existingIds.has(a._id));
        return [...prev, ...newArticles];
      });
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setPage(p => p + 1);
    } catch (e) { console.error(e); }
    setLoadingMore(false);
  };

  const pinnedAd = ads.find(a => a.isPinned && a.isActive);
  const featuredArticles = allArticles.slice(0, 6);
  const previewArticles = allArticles;

  if (loading) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={C.redDark} />
        <HeroBanner
          onSearchPress={() => { }}
          notificationsEnabled={true}
          onToggleNotifications={() => { }}
        />
        <PulseCard h={220} />
        <PulseCard h={200} />
        <PulseCard h={80} />
        <PulseCard h={80} />
        <PulseCard h={80} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Search Modal */}
      <Modal visible={searchVisible} animationType="slide" transparent={false}>
        <KeyboardAvoidingView style={styles.searchModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => setSearchVisible(false)} style={styles.cancelSearchBtn}>
              <Text style={styles.cancelSearchText}>إلغاء</Text>
            </TouchableOpacity>
            <View style={styles.searchInputWrap}>
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن خبر، عائلة، أو مناسبة..."
                placeholderTextColor={C.textMuted}
                autoFocus
                returnKeyType="search"
                value={searchQuery}
                onChangeText={executeSearch}
              />
              <Ionicons name="search" size={18} color={C.textMuted} />
            </View>
          </View>

          <ScrollView style={styles.searchBody} keyboardShouldPersistTaps="handled">
            {isSearching ? (
              <ActivityIndicator size="large" color={C.red} style={{ marginTop: 40 }} />
            ) : searchResults.length > 0 ? (
              searchResults.map((article, index) => (
                <View key={article._id} style={{ marginBottom: 12 }}>
                  <ArticleRow article={article} index={index} />
                </View>
              ))
            ) : searchQuery.length >= 2 ? (
              <View style={styles.searchEmpty}>
                <Ionicons name="search-outline" size={48} color={C.cardBorder} />
                <Text style={[styles.emptyText, { marginTop: 16 }]}>لم يتم العثور على نتائج</Text>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.red} colors={[C.red]} />}
      >
        <StatusBar barStyle="light-content" backgroundColor={C.redDark} />

        {/* ① HERO BANNER */}
        <HeroBanner
          onSearchPress={() => setSearchVisible(true)}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
        />

        {/* ② PINNED AD */}
        {pinnedAd && <PinnedAdCard ad={pinnedAd} />}

        {/* ③ FEATURED SLIDER */}
        {featuredArticles.length > 0 && <FeaturedSlider articles={featuredArticles} />}

        {/* ④ ARTICLES SECTION */}
        {allArticles.length > 1 && (
          <View style={styles.articlesSection}>
            <SectionHeader title="آخر الأخبار" />

            <View style={styles.articlesList}>
              {previewArticles.map((a, i) => (
                <ArticleRow key={a._id} article={a} index={i} />
              ))}
            </View>

            {/* Load More Button */}
            {hasMore && (
              <LoadMoreButton onPress={handleLoadMore} loading={loadingMore} />
            )}

            {!hasMore && allArticles.length > 0 && (
              <View style={styles.endTag}>
                <Ionicons name="checkmark-circle" size={18} color={C.textMuted} />
                <Text style={styles.endTagText}>وصلت لنهاية الأخبار</Text>
              </View>
            )}
          </View>
        )}

        {/* Empty state */}
        {allArticles.length === 0 && !pinnedAd && (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={64} color={C.cardBorder} />
            <Text style={styles.emptyText}>لا توجد أخبار بعد</Text>
            <Text style={styles.emptySubText}>تحقق مجدداً لاحقاً</Text>
          </View>
        )}

        <SocialFooter />
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Floating WhatsApp Button */}
      <DraggableWhatsApp />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // ── Floating WhatsApp ──
  whatsappContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20, // Physical Left in RTL mode
    zIndex: 999,
  },
  fabWhatsApp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dropZone: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 998,
  },
  dropZoneInner: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: C.redDark,
    alignItems: 'center', justifyContent: 'center', opacity: 0.9,
    borderWidth: 2, borderColor: C.cardBorder,
  },
  dropZoneText: { color: C.textSecondary, fontSize: 12, marginTop: 8, fontWeight: 'bold' },

  // ── Modern Banner ──
  modernBanner: {
    paddingTop: IS_WEB ? 16 : 50,
    paddingBottom: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  bannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  bannerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  bannerRight: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  modernLogo: { width: 140, height: 75, resizeMode: 'contain' },
  bannerLeftBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.cardBorder,
  },
  notificationDot: {
    position: 'absolute', top: 10, right: 11, width: 10, height: 10,
    borderRadius: 5, backgroundColor: C.redLight,
    borderWidth: 2, borderColor: C.bg
  },
  bannerDateText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    lineHeight: 18,
  },

  // ── Footer ──
  footer: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  footerSocial: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14,
  },
  footerBtn: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.gold + '30',
  },
  footerBtnLabel: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  footerCopy: {
    color: C.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  poweredByBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 4,
  },
  poweredByText: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
  },

  // ── Section labels ──
  sectionLabelRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 10, marginTop: 18 },
  sectionLabelBar: { flex: 1, height: 2, borderRadius: 2 },
  adPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.red + '22', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.red + '44',
  },
  adPillText: { color: C.gold, fontSize: 11, fontWeight: '700' },

  // ── Pinned Ad ──
  pinnedAdWrap: {},
  adCard: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', shadowColor: C.red, shadowRadius: 20, shadowOpacity: 0.4, elevation: 10 },
  adImageWrap: { position: 'relative' },
  adImage: { width: '100%', height: IS_WEB ? 200 : H * 0.27 },
  adImagePlaceholder: { width: '100%', height: IS_WEB ? 200 : H * 0.27, alignItems: 'center', justifyContent: 'center' },
  adOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
  adOverlayContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  adTitle: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  adDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, textAlign: 'right' },

  // ── Video badge ──
  videoBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  videoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // ── Featured Article ──
  sliderWrap: { paddingBottom: 10 },
  featuredCard: {
    marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowRadius: 16, shadowOpacity: 0.5, elevation: 8,
    borderWidth: 1, borderColor: C.cardBorder,
  },
  featuredImage: { width: SCREEN_WIDTH - 32, height: IS_WEB ? 220 : H * 0.3 },
  featuredImagePlaceholder: { width: SCREEN_WIDTH - 32, height: IS_WEB ? 220 : H * 0.3, alignItems: 'center', justifyContent: 'center' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%' },
  featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 6, alignItems: 'flex-end' },
  catBadge: {
    alignSelf: 'flex-end', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1,
  },
  catBadgeText: { fontSize: 11, fontWeight: '800' },
  featuredTitle: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'right', lineHeight: 26 },
  featuredDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'right' },
  featuredMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: C.textSecondary, fontSize: 12 },
  metaDate: { color: C.textSecondary, fontSize: 12 },

  // ── Slider Dots ──
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3a1010' },
  dotActive: { width: 16, backgroundColor: C.gold },

  // ── Articles section ──
  articlesSection: { paddingBottom: 8 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, marginVertical: 18,
  },
  sectionLine: { flex: 1, height: 1, borderRadius: 1 },
  sectionTitle: {
    color: C.textPrimary, fontSize: 14, fontWeight: '800',
    letterSpacing: 1, textAlign: 'center',
  },
  articlesList: {
    marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.cardBorder,
    backgroundColor: C.card,
  },

  // ── Article Row ──
  articleRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: C.cardBorder,
  },
  thumbWrap: { position: 'relative', flexShrink: 0 },
  thumb: { width: 82, height: 66, borderRadius: 12 },
  thumbPlaceholder: { width: 82, height: 66, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumbCatDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: C.card },
  articleText: { flex: 1, gap: 5, alignItems: 'flex-end' },
  catBadgeSmall: { alignSelf: 'flex-end', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  catBadgeSmallText: { fontSize: 10, fontWeight: '700' },
  articleTitle: { color: C.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl', lineHeight: 20, width: '100%' },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  articleMetaText: { color: C.textMuted, fontSize: 11, textAlign: 'right', writingDirection: 'rtl' },

  // ── See All ──
  seeAllWrap: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  seeAllText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // ── End / Empty ──
  endTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  endTagText: { color: C.textMuted, fontSize: 13 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: C.textSecondary, fontSize: 18, fontWeight: '700' },
  emptySubText: { color: C.textMuted, fontSize: 13 },

  // ── Search Modal ──
  searchModalContainer: { flex: 1, backgroundColor: C.bg },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 50, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.cardBorder, gap: 12 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: C.cardBorder },
  searchInput: { flex: 1, color: C.textPrimary, textAlign: 'right', fontSize: 15, marginStart: 8, height: '100%' },
  cancelSearchBtn: { padding: 8 },
  cancelSearchText: { color: C.red, fontSize: 16, fontWeight: '600' },
  searchBody: { flex: 1, padding: 16 },
  searchEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.5 },
});
