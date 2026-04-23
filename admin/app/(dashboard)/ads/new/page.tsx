'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { ArrowRight, Upload, X, Film } from 'lucide-react';
import Link from 'next/link';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), { ssr: false });

export default function NewAdPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', content: '',
    imageUrl: '', videoUrl: '', linkUrl: '',
    isPinned: true, isActive: true, order: 0,
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingImg(true);
    try {
      const url = await apiClient.uploadImage(file, token);
      set('imageUrl', url);
      toast.success('تم رفع الصورة');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally { setUploadingImg(false); }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!token) throw new Error('غير مصرح');
    return apiClient.uploadImage(file, token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('عنوان الإعلان مطلوب'); return; }
    setSaving(true);
    try {
      await apiClient.post('/api/ads', form, token!);
      toast.success('تم إنشاء الإعلان');
      router.push('/ads');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الإنشاء');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/ads" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">إعلان جديد</h1>
          <p className="text-gray-400 mt-0.5 text-sm">إضافة إعلان مثبت جديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">صورة الغلاف</label>
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="إعلان" className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => set('imageUrl', '')} className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImg ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleImgUpload} disabled={uploadingImg} />
              {uploadingImg ? <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-500">اضغط لرفع الصورة</span></>}
            </label>
          )}
        </div>

        {/* Video Upload */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" /> فيديو الإعلان (اختياري)
          </label>
          {form.videoUrl ? (
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <Film className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <p className="text-sm text-gray-300 truncate flex-1">{form.videoUrl.split('/').pop()}</p>
              <button type="button" onClick={() => set('videoUrl', '')} className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingVid ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="video/mp4,video/webm,video/quicktime" onChange={async (e) => {
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

        {/* Fields */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">عنوان الإعلان <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="عنوان الإعلان" className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوصف المختصر</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="وصف مختصر يظهر على بطاقة الإعلان (اختياري)" className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">رابط خارجي</label>
            <input value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="https://example.com (اختياري)" dir="ltr" className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الترتيب</label>
            <input type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} min={0} className="w-32 bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <span className="text-xs text-gray-500 mr-2">الأرقام الأصغر تظهر أولاً</span>
          </div>
        </div>

        {/* Rich Content Editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            محتوى الإعلان <span className="text-gray-500 font-normal text-xs">(نصوص، صور، تفاصيل — يظهر عند فتح الإعلان)</span>
          </label>
          <TipTapEditor
            content={form.content}
            onChange={html => set('content', html)}
            onImageUpload={handleEditorImageUpload}
          />
        </div>

        {/* Options */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-medium text-gray-300">الخيارات</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => set('isPinned', e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <span className="text-gray-200">تثبيت في أعلى الصفحة الرئيسية</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <span className="text-gray-200">تفعيل الإعلان فوراً</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الحفظ...</span> : 'حفظ الإعلان'}
          </button>
          <Link href="/ads" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-center">إلغاء</Link>
        </div>
      </form>
    </div>
  );
}
