// Platform-aware API base URL:
// - Web browser  → localhost:5000
// - Android emulator → 10.0.2.2:5000 (emulator's alias for host machine)
// - Real device / prod → set EXPO_PUBLIC_API_URL in .env
import { Platform } from 'react-native';
import { getDeviceId } from './device';

function getApiBase(): string {
  // If this is a production build (APK/IPA), always force the cloud database
  if (!__DEV__) return 'https://ayam-knawyeh-production.up.railway.app';
  
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return 'http://127.0.0.1:5000';
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://127.0.0.1:5000'; // iOS simulator
}

const API_BASE = getApiBase();


export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  category: string;
  isPublished: boolean;
  views: number;
  tags: string[];
  createdAt: string;
}

export interface Ad {
  _id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  isPinned: boolean;
  isActive: boolean;
  order: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Helper to fix localhost URLs for physical devices
function fixUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.includes('localhost:5000')) {
    return url.replace('http://localhost:5000', API_BASE);
  }
  return url;
}

// ─── Retry helper ─────────────────────────────────────────────────────────────
// Retries a fetch call up to `retries` times with a delay between attempts.
// This handles the case where the server or a network proxy returns an
// empty/error response on the first try (e.g. edge-cache glitch).
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 2000
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      // Treat a successful HTTP response as a success regardless of body
      if (res.ok) return res;
      // On the last attempt, return the failing response so the caller can throw
      if (attempt === retries) return res;
    } catch (err) {
      if (attempt === retries) throw err;
    }
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  // Should never be reached, but TypeScript needs a return
  return fetch(url, options);
}

export const api = {
  getArticles: async (page = 1, limit = 10, category?: string, search?: string): Promise<{ articles: Article[]; pagination: Pagination }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    // _t busts any network/CDN cache that may have saved an old empty response
    params.set('_t', String(Date.now()));
    const res = await fetchWithRetry(`${API_BASE}/api/articles?${params}`);
    if (!res.ok) throw new Error('فشل جلب الأخبار');
    const data = await res.json();
    data.articles = data.articles.map((a: Article) => ({
      ...a,
      imageUrl: fixUrl(a.imageUrl),
      videoUrl: fixUrl(a.videoUrl),
      content: a.content ? a.content.replace(/http:\/\/localhost:5000/g, API_BASE) : a.content,
    }));
    return data;
  },

  getArticle: async (id: string): Promise<{ article: Article }> => {
    // noview=1: the view is counted separately (once per device) by recordView().
    const res = await fetchWithRetry(`${API_BASE}/api/articles/${id}?noview=1&_t=${Date.now()}`);
    if (!res.ok) throw new Error('فشل جلب الخبر');
    const data = await res.json();
    data.article.imageUrl = fixUrl(data.article.imageUrl);
    data.article.videoUrl = fixUrl(data.article.videoUrl);
    if (data.article.content) data.article.content = data.article.content.replace(/http:\/\/localhost:5000/g, API_BASE);
    return data;
  },

  getAds: async (): Promise<{ ads: Ad[] }> => {
    const res = await fetchWithRetry(`${API_BASE}/api/ads?_t=${Date.now()}`);
    if (!res.ok) throw new Error('فشل جلب الإعلانات');
    const data = await res.json();
    data.ads = data.ads.map((a: Ad) => ({
      ...a,
      imageUrl: fixUrl(a.imageUrl),
      videoUrl: fixUrl(a.videoUrl),
      content: a.content ? a.content.replace(/http:\/\/localhost:5000/g, API_BASE) : a.content,
    }));
    return data;
  },

  /** Counts a view of this article once per phone. Never throws: views are best-effort. */
  recordView: async (id: string): Promise<void> => {
    try {
      const deviceId = await getDeviceId();
      await fetch(`${API_BASE}/api/articles/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
    } catch {
      // ignore: a missed view is not worth bothering the reader
    }
  },

  /** `categories`: the categories to be notified about; [] means all of them. */
  togglePushSubscription: async (token: string, subscribe: boolean, categories?: string[]) => {
    const endpoint = subscribe ? 'subscribe' : 'unsubscribe';
    const res = await fetch(`${API_BASE}/api/notifications/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS, ...(categories ? { categories } : {}) }),
    });
    if (!res.ok) throw new Error('Failed to toggle subscription');
    return res.json();
  },
};

export { API_BASE };
