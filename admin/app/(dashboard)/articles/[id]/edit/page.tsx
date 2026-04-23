'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { CATEGORIES, Article } from '@/lib/types';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { ArrowRight, Upload, X } from 'lucide-react';
import Link from 'next/link';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), { ssr: false });

export default function EditArticlePage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', content: '', imageUrl: '',
    author: '', category: 'اخبار البلد', tags: '', isPublished: true,
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!token || !id) return;
    apiClient.get(`/api/articles/${id}`, token)
      .then(data => {
        const a: Article = data.article;
        setForm({
          title: a.title, description: a.description, content: a.content,
          imageUrl: a.imageUrl || '', author: a.author, category: a.category,
          tags: a.tags.join(', '), isPublished: a.isPublished,
        });
      })
      .catch(() => toast.error('خطأ في جلب الخبر'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingImg(true);
    try {
      const url = await apiClient.uploadImage(file, token);
      set('imageUrl', url);
      toast.success('تم رفع الصورة');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!token) throw new Error('غير مصرح');
    return apiClient.uploadImage(file, token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.content) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put(`/api/articles/${id}`, {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      }, token!);
      toast.success('تم تحديث الخبر');
      router.push('/articles');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في التحديث');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/articles" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">تعديل الخبر</h1>
          <p className="text-gray-400 mt-0.5 text-sm">تعديل المقال الإخباري</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">صورة الغلاف</label>
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="غلاف" className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => set('imageUrl', '')} className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImg ? 'border-emerald-500' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingImg} />
              {uploadingImg ? <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                : <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-500">اضغط لرفع صورة</span></>}
            </label>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">العنوان <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوصف <span className="text-red-400">*</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الكاتب</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">التصنيف</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوسوم</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="مفصولة بفاصلة" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">المحتوى <span className="text-red-400">*</span></label>
          <TipTapEditor content={form.content} onChange={html => set('content', html)} onImageUpload={handleEditorImageUpload} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} className="w-4 h-4 accent-emerald-500" />
            <span className="text-gray-200">منشور</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الحفظ...</span> : 'حفظ التغييرات'}
          </button>
          <Link href="/articles" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-center">إلغاء</Link>
        </div>
      </form>
    </div>
  );
}
