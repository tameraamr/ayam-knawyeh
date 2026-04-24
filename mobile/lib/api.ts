// Platform-aware API base URL:
// - Web browser  → localhost:5000
// - Android emulator → 10.0.2.2:5000 (emulator's alias for host machine)
// - Real device / prod → set EXPO_PUBLIC_API_URL in .env
import { Platform } from 'react-native';

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

export const api = {
  getArticles: async (page = 1, limit = 10, category?: string, search?: string): Promise<{ articles: Article[]; pagination: Pagination }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const res = await fetch(`${API_BASE}/api/articles?${params}`);
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
    const res = await fetch(`${API_BASE}/api/articles/${id}`);
    if (!res.ok) throw new Error('فشل جلب الخبر');
    const data = await res.json();
    data.article.imageUrl = fixUrl(data.article.imageUrl);
    data.article.videoUrl = fixUrl(data.article.videoUrl);
    if (data.article.content) data.article.content = data.article.content.replace(/http:\/\/localhost:5000/g, API_BASE);
    return data;
  },

  getAds: async (): Promise<{ ads: Ad[] }> => {
    const res = await fetch(`${API_BASE}/api/ads`);
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

  togglePushSubscription: async (token: string, subscribe: boolean) => {
    const endpoint = subscribe ? 'subscribe' : 'unsubscribe';
    const res = await fetch(`${API_BASE}/api/notifications/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Failed to toggle subscription');
    return res.json();
  },
};

export { API_BASE };
