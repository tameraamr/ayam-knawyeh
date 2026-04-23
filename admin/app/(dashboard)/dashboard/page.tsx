'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Stats } from '@/lib/types';
import { Newspaper, Megaphone, Eye, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiClient.get('/api/notifications/stats', token)
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = stats ? [
    {
      label: 'إجمالي الأخبار',
      value: stats.articles.total,
      sub: `${stats.articles.published} منشور`,
      icon: Newspaper,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
    },
    {
      label: 'الأخبار المنشورة',
      value: stats.articles.published,
      sub: `${stats.articles.total - stats.articles.published} مسودة`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
    },
    {
      label: 'الإعلانات النشطة',
      value: stats.ads.active,
      sub: `${stats.ads.total} إجمالاً`,
      icon: Megaphone,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
    },
    {
      label: 'إجمالي المشاهدات',
      value: stats.totalViews.toLocaleString('ar'),
      sub: 'مشاهدة لجميع الأخبار',
      icon: Eye,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-gray-400 mt-1">مرحباً بك في نظام إدارة أخبار ايام كناوية</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-gray-800 rounded-xl mb-4" />
              <div className="h-8 bg-gray-800 rounded-lg mb-2 w-1/2" />
              <div className="h-4 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(({ label, value, sub, icon: Icon, bg, text }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
              <div className="text-xs text-gray-600 mt-1">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/articles/new" className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Plus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-medium text-white">نشر خبر جديد</div>
              <div className="text-sm text-gray-500">أضف مقالاً جديداً</div>
            </div>
          </Link>
          <Link href="/ads/new" className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Megaphone className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="font-medium text-white">إضافة إعلان</div>
              <div className="text-sm text-gray-500">أنشئ إعلاناً مثبتاً</div>
            </div>
          </Link>
          <Link href="/notifications" className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-white">إرسال إشعار</div>
              <div className="text-sm text-gray-500">أرسل إشعاراً فورياً</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
