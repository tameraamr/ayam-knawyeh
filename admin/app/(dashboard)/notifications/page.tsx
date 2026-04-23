'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Article } from '@/lib/types';
import toast from 'react-hot-toast';
import { Bell, Send, ChevronDown } from 'lucide-react';

export default function NotificationsPage() {
  const { token } = useAuth();
  const [sending, setSending] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState({ title: '', body: '', articleId: '' });

  useEffect(() => {
    if (!token) return;
    apiClient.get('/api/articles/all', token)
      .then(d => setArticles(d.articles.filter((a: Article) => a.isPublished)))
      .catch(console.error);
  }, [token]);

  const handleArticleSelect = (id: string) => {
    const article = articles.find(a => a._id === id);
    if (article) {
      setForm({ title: article.title, body: article.description, articleId: id });
    } else {
      setForm(prev => ({ ...prev, articleId: '' }));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) { toast.error('العنوان والرسالة مطلوبان'); return; }
    setSending(true);
    try {
      const result = await apiClient.post('/api/notifications/send', form, token!);
      if (result.success) {
        toast.success('تم إرسال الإشعار بنجاح!');
        setForm({ title: '', body: '', articleId: '' });
      } else {
        toast.error(result.message || 'Firebase غير مفعّل بعد — يرجى إضافة بيانات Firebase');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الإرسال');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">الإشعارات</h1>
        <p className="text-gray-400 mt-1">إرسال إشعارات فورية لجميع مستخدمي التطبيق</p>
      </div>

      {/* Firebase Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
        <div className="flex gap-3">
          <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium text-sm">إعداد Firebase مطلوب</p>
            <p className="text-amber-400/80 text-sm mt-1">
              لتفعيل الإشعارات، أضف بيانات Firebase إلى ملف <code className="bg-amber-500/20 px-1 rounded">.env</code> في مجلد backend.
              راجع ملف <code className="bg-amber-500/20 px-1 rounded">backend/src/services/fcm.js</code> للتعليمات.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        {/* Quick fill from article */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">ملء من خبر موجود (اختياري)</label>
          <div className="relative">
            <select
              value={form.articleId}
              onChange={e => handleArticleSelect(e.target.value)}
              className="w-full appearance-none bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر خبراً...</option>
              {articles.map(a => (
                <option key={a._id} value={a._id}>{a.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="border-t border-gray-800" />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">عنوان الإشعار <span className="text-red-400">*</span></label>
          <input
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="عنوان مختصر وجذاب"
            maxLength={100}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">{form.title.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">نص الإشعار <span className="text-red-400">*</span></label>
          <textarea
            value={form.body}
            onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
            placeholder="نص الإشعار الذي سيراه المستخدمون..."
            rows={4}
            maxLength={300}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">{form.body.length}/300</p>
        </div>

        {/* Preview */}
        {(form.title || form.body) && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">معاينة الإشعار</p>
            <div className="bg-gray-950 rounded-xl p-4 flex gap-3 items-start">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="font-semibold text-white text-sm">{form.title || 'عنوان الإشعار'}</p>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{form.body || 'نص الإشعار...'}</p>
                <p className="text-gray-600 text-xs mt-1">الآن • ايام كناوية</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {sending ? (
            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الإرسال...</>
          ) : (
            <><Send className="w-5 h-5" />إرسال للجميع</>
          )}
        </button>
      </form>
    </div>
  );
}
