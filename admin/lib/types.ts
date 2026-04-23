export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  author: string;
  category: string;
  isPublished: boolean;
  views: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  isPinned: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export interface Stats {
  articles: { total: number; published: number };
  ads: { total: number; active: number };
  totalViews: number;
}

export const CATEGORIES = ['اخبار البلد', 'مواليد جدد', 'ابناء كفركنا', 'افراح', 'يصادف اليوم', 'محلات تجارية', 'تنويهات'];
