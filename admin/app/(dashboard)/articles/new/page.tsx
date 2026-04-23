'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { CATEGORIES } from '@/lib/types';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { ArrowRight, Upload, X, Film } from 'lucide-react';
import Link from 'next/link';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), { ssr: false });

export default function NewArticlePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    author: 'المحرر',
    category: 'اخبار البلد',
    tags: '',
    isPublished: true,
    sendNotification: true,
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

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
      await apiClient.post('/api/articles', {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      }, token!);
      toast.success('تم نشر الخبر بنجاح');
      router.push('/articles');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في النشر');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/articles" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">خبر جديد</h1>
          <p className="text-gray-400 mt-0.5 text-sm">إضافة مقال إخباري جديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">صورة الغلاف</label>
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="غلاف" className="w-full h-48 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => set('imageUrl', '')}
                className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImg ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingImg} />
              {uploadingImg ? (
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">اضغط لرفع صورة الغلاف</span>
                  <span className="text-xs text-gray-600 mt-1">JPG, PNG, WebP — حتى 10MB</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Video Upload */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" /> فيديو الخبر (اختياري)
          </label>
          {form.videoUrl ? (
            <div className="relative flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <Film className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <p className="text-sm text-gray-300 truncate flex-1">{form.videoUrl.split('/').pop()}</p>
              <button type="button" onClick={() => set('videoUrl', '')} className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingVid ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file || !token) return;
                setUploadingVid(true);
                try {
                  const fd = new FormData(); fd.append('video', file);
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
                  const data = await res.json();
                  if (data.videoUrl) { set('videoUrl', data.videoUrl); toast.success('تم رفع الفيديو'); }
                  else toast.error(data.error || 'فشل رفع الفيديو');
                } catch { toast.error('فشل رفع الفيديو'); } finally { setUploadingVid(false); }
              }} disabled={uploadingVid} />
              {uploadingVid ? <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <>
                <Film className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-500">اضغط لرفع فيديو</span>
                <span className="text-xs text-gray-600 mt-1">MP4, WebM, MOV — حتى 200MB</span>
              </>}
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">عنوان الخبر <span className="text-red-400">*</span></label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="أدخل عنوان الخبر..."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <label className="block text-sm font-medium text-gray-300 mb-1">الوصف المختصر <span className="text-red-400">*</span></label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="وصف مختصر للخبر يظهر في قائمة الأخبار..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">الكاتب</label>
              <input
                value={form.author}
                onChange={e => set('author', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">التصنيف</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوسوم (مفصولة بفاصلة)</label>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="مثال: كناوة، أخبار، محلات تجارية"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">محتوى الخبر <span className="text-red-400">*</span></label>
          <TipTapEditor
            content={form.content}
            onChange={html => set('content', html)}
            onImageUpload={handleEditorImageUpload}
          />
        </div>

        {/* Options */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-medium text-gray-300">خيارات النشر</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
            <span className="text-gray-200">نشر الخبر فوراً</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.sendNotification} onChange={e => set('sendNotification', e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
            <span className="text-gray-200">إرسال إشعار للمستخدمين</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جارٍ النشر...
              </span>
            ) : 'نشر الخبر'}
          </button>
          <Link href="/articles" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-center">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
