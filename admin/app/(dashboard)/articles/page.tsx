'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Article } from '@/lib/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, Search, CheckCircle, XCircle } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'اخبار البلد': 'bg-emerald-500/10 text-emerald-400',
  'مواليد جدد': 'bg-blue-500/10 text-blue-400',
  'ابناء كفركنا': 'bg-purple-500/10 text-purple-400',
  'افراح': 'bg-orange-500/10 text-orange-400',
  'يصادف اليوم': 'bg-yellow-500/10 text-yellow-400',
  'محلات تجارية': 'bg-pink-500/10 text-pink-400',
  'تنويهات': 'bg-cyan-500/10 text-cyan-400',
};

export default function ArticlesPage() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = async () => {
    if (!token) return;
    try {
      const data = await apiClient.get('/api/articles/all', token);
      setArticles(data.articles);
      setFiltered(data.articles);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في جلب الأخبار');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [token]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(articles.filter(a => a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q)));
  }, [search, articles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/articles/${id}`, token!);
      toast.success('تم حذف الخبر');
      setArticles(prev => prev.filter(a => a._id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الأخبار</h1>
          <p className="text-gray-400 mt-1">{articles.length} خبر</p>
        </div>
        <Link
          href="/articles/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
        >
          <Plus className="w-5 h-5" />
          خبر جديد
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث في الأخبار..."
          className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {search ? 'لا توجد نتائج للبحث' : 'لا توجد أخبار بعد. أضف أول خبر!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-right">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">الخبر</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">التصنيف</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">الحالة</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">المشاهدات</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">التاريخ</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(article => (
                  <tr key={article._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {article.imageUrl && (
                          <img src={article.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-white line-clamp-1">{article.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{article.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[article.category] || 'bg-gray-700 text-gray-300'}`}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {article.isPublished ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                          <CheckCircle className="w-4 h-4" /> منشور
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <XCircle className="w-4 h-4" /> مسودة
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">{article.views.toLocaleString('ar')}</td>
                    <td className="px-4 py-4 text-gray-400 text-sm">
                      {new Date(article.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/articles/${article._id}/edit`}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id, article.title)}
                          disabled={deletingId === article._id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === article._id
                            ? <span className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin block" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
