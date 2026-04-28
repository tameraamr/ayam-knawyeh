import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, ActivityIndicator, Linking, Platform, Animated, Alert
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { api, Ad } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FadeDown({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
    }, []);
    return (
        <Animated.View style={[{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }, style]}>
            {children}
        </Animated.View>
    );
}

const { width: W, height: H } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

const C = {
    bg: '#0c0101', card: '#1e0808', cardBorder: '#3a1010',
    red: '#c8102e', redDark: '#8b0000', gold: '#d4af37',
    goldLight: '#f0d060', textPrimary: '#f5ede0',
    textSecondary: '#a08878', textMuted: '#5a3a3a',
};

// ── Article-style CSS for the rich HTML content ────────────────────────────────
const CONTENT_CSS = `
  body { margin: 0; padding: 0 16px 24px; background: transparent;
    font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; }
  p { color: #f0e8dc; font-size: 15px; line-height: 1.9; margin: 0 0 14px; text-align: right; }
  h1,h2,h3 { color: #f5ede0; text-align: right; margin: 18px 0 10px; }
  h2 { font-size: 19px; border-right: 4px solid #c8102e; padding-right: 10px; }
  h3 { font-size: 16px; color: #d4af37; }
  img { max-width: 100%; border-radius: 12px; margin: 12px 0; display: block; }
  video { max-width: 100%; border-radius: 12px; margin: 12px 0; }
  a { color: #d4af37; }
  ul, ol { color: #f0e8dc; text-align: right; padding-right: 20px; line-height: 1.9; }
  blockquote { border-right: 3px solid #c8102e; margin: 14px 0; padding: 8px 14px;
    background: rgba(200,16,46,0.08); border-radius: 0 8px 8px 0; color: #c0a090; }
  strong { color: #fff; }
`;

// ── Web HTML renderer ────────────────────────────────────────────────────────────
function WebContent({ html }: { html: string }) {
    return (
        <div
            style={{ width: '100%', color: '#f0e8dc', direction: 'rtl', fontFamily: 'sans-serif' }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ── Native WebView wrapper ───────────────────────────────────────────────────────
function NativeContent({ html }: { html: string }) {
    const [height, setHeight] = useState(200);
    const { WebView } = require('react-native-webview');
    const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>${CONTENT_CSS}</style></head><body>${html}
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

function RichContent({ html }: { html: string }) {
    if (IS_WEB) return <WebContent html={html} />;
    return <NativeContent html={html} />;
}

// ── Video player ─────────────────────────────────────────────────────────────────
function VideoPlayer({ uri }: { uri: string }) {
    if (IS_WEB) {
        return (
            // @ts-ignore
            <video src={uri} controls style={{ width: '100%', maxHeight: 320, borderRadius: 16, backgroundColor: '#000', display: 'block' }} />
        );
    }
    const { Video, ResizeMode } = require('expo-av');
    return (
        <Video
            source={{ uri }}
            style={{ width: W, height: H * 0.35 }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
        />
    );
}

// ── Main screen ─────────────────────────────────────────────────────────────────
export default function AdDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        (async () => {
            try {
                const { ads } = await api.getAds();
                setAd(ads.find(a => a._id === id) || null);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const handleReport = () => {
        if (Platform.OS === 'web') {
            alert("تم الإبلاغ. شكراً لك. سيقوم فريقنا بمراجعة هذا المحتوى قريباً.");
            return;
        }
        Alert.alert(
            "إبلاغ عن محتوى",
            "هل أنت متأكد أنك تريد الإبلاغ عن هذا الإعلان كمحتوى مسيء أو غير لائق؟",
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
            <View style={[styles.screen, styles.centered]}>
                <ActivityIndicator size="large" color={C.red} />
            </View>
        );
    }

    if (!ad) {
        return (
            <View style={[styles.screen, styles.centered]}>
                <Ionicons name="alert-circle-outline" size={48} color={C.textMuted} />
                <Text style={styles.errorText}>الإعلان غير موجود</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>عودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasContent = !!ad.content && ad.content.trim() !== '' && ad.content !== '<p></p>';

    return (
        <View style={styles.screen}>
            {/* Floating back button */}
            <View style={styles.floatingBack}>
                <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackBtn}>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ 
                    flexGrow: 1, 
                    paddingBottom: 40,
                    paddingTop: (!ad.videoUrl && !ad.imageUrl) ? insets.top + 20 : 0
                }} 
                showsVerticalScrollIndicator={false} 
                nestedScrollEnabled={true}
            >

                {/* ① Hero media */}
                {ad.videoUrl ? (
                    <View>
                        <VideoPlayer uri={ad.videoUrl} />
                    </View>
                ) : ad.imageUrl ? (
                    <View style={styles.heroWrap}>
                        <Image source={{ uri: ad.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                        <LinearGradient colors={['transparent', 'rgba(12,1,1,0.9)']} style={styles.heroOverlay} />
                    </View>
                ) : null}

                {/* ② Header */}
                <FadeDown delay={100} style={styles.header}>
                    {/* Ad badge & Report */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={styles.adBadge}>
                            <Ionicons name="megaphone" size={12} color={C.gold} />
                            <Text style={styles.adBadgeText}>إعلان مميز</Text>
                        </View>
                        <TouchableOpacity onPress={handleReport} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Ionicons name="flag-outline" size={14} color={C.textMuted} />
                            <Text style={{ color: C.textMuted, fontSize: 12 }}>إبلاغ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{ad.title}</Text>

                    {/* Gold divider */}
                    <LinearGradient
                        colors={[C.gold, C.gold + '40', 'transparent']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />

                    {/* Short description */}
                    {ad.description ? <Text style={styles.shortDesc}>{ad.description}</Text> : null}
                </FadeDown>

                {/* ③ Rich content body — text, images, embedded videos */}
                {hasContent && (
                    <FadeDown delay={150} style={styles.contentWrap}>
                        <RichContent html={ad.content!} />
                    </FadeDown>
                )}

                {/* ④ External link button */}
                {ad.linkUrl ? (
                    <FadeDown delay={250} style={styles.linkWrap}>
                        <TouchableOpacity onPress={() => Linking.openURL(ad.linkUrl!)} activeOpacity={0.85}>
                            <LinearGradient
                                colors={[C.redDark, C.red]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.linkBtn}
                            >
                                <Text style={styles.linkBtnText}>اعرف أكثر</Text>
                                <Ionicons name="open-outline" size={16} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </FadeDown>
                ) : null}

                {/* ⑤ Footer */}
                <View style={styles.footer}>
                    <LinearGradient colors={['transparent', C.gold + '30', 'transparent']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, marginBottom: 14 }} />
                    <View style={styles.footerSocial}>
                        {[
                            { icon: 'facebook-f', label: 'Facebook', url: 'https://facebook.com/kanna.days', appUrl: 'fb://facewebmodal/f?href=https://facebook.com/kanna.days' },
                            { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/ayam.knawyeh', appUrl: 'instagram://user?username=ayam.knawyeh' },
                            { icon: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@aeamknaweah', appUrl: 'tiktok://@aeamknaweah' },
                        ].map(s => (
                            <TouchableOpacity key={s.label} style={styles.footerBtn} onPress={async () => {
                                try {
                                    const supported = await Linking.canOpenURL(s.appUrl);
                                    if (supported) await Linking.openURL(s.appUrl);
                                    else await Linking.openURL(s.url);
                                } catch (e) {
                                    Linking.openURL(s.url);
                                }
                            }}>
                                <FontAwesome5 name={s.icon as any} size={13} color={C.gold} />
                                <Text style={styles.footerLabel}>{s.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 48 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
    errorText: { color: C.textSecondary, fontSize: 18, fontWeight: '700' },

    videoWrap: { width: '100%', backgroundColor: '#000', borderRadius: IS_WEB ? 0 : 0 },
    heroWrap: { position: 'relative' },
    heroImage: { width: '100%', height: IS_WEB ? 280 : H * 0.4 },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },

    floatingBack: { position: 'absolute', top: IS_WEB ? 14 : 50, right: 16, zIndex: 50 },
    floatingBackBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center', justifyContent: 'center',
    },

    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4, gap: 12 },
    adBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end',
        backgroundColor: C.red + '22', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: C.red + '44',
    },
    adBadgeText: { color: C.gold, fontSize: 12, fontWeight: '700' },
    title: { color: C.textPrimary, fontSize: 22, fontWeight: '900', textAlign: 'right', lineHeight: 34 },
    divider: { height: 2, borderRadius: 2 },
    shortDesc: { color: C.textSecondary, fontSize: 14, textAlign: 'right', lineHeight: 24 },

    contentWrap: {
        marginHorizontal: 4, marginTop: 10,
        padding: IS_WEB ? 12 : 0,
    },

    linkWrap: { marginHorizontal: 20, marginTop: 20, borderRadius: 14, overflow: 'hidden' },
    linkBtn: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, paddingVertical: 14,
    },
    linkBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

    backBtn: { backgroundColor: C.red, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
    backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    footer: { marginTop: 32, paddingHorizontal: 20 },
    footerSocial: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 12 },
    footerBtn: {
        alignItems: 'center', gap: 5,
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 14, backgroundColor: C.card,
        borderWidth: 1, borderColor: C.gold + '30',
    },
    footerLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '600' },
});
