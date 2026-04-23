'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowRight, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function EditAdPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '',
    linkUrl: '', isPinned: true, isActive: true, order: 0,
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!token || !id) return;
    apiClient.get(`/api/ads/all`, token)
      .then(data => {
        const ad = data.ads.find((a: { _id: string }) => a._id === id);
        if (ad) setForm({ title: ad.title, description: ad.description || '', imageUrl: ad.imageUrl || '', linkUrl: ad.linkUrl || '', isPinned: ad.isPinned, isActive: ad.isActive, order: ad.order });
        else toast.error('الإعلان غير موجود');
      })
      .catch(() => toast.error('خطأ في جلب الإعلان'))
      .finally(() => setLoading(false));
  }, [token, id]);

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
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('عنوان الإعلان مطلوب'); return; }
    setSaving(true);
    try {
      await apiClient.put(`/api/ads/${id}`, form, token!);
      toast.success('تم تحديث الإعلان');
      router.push('/ads');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في التحديث');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/ads" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"><ArrowRight className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-white">تعديل الإعلان</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-300 mb-3">صورة الإعلان</label>
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="إعلان" className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => set('imageUrl', '')} className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-lg text-white"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer ${uploadingImg ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleImgUpload} disabled={uploadingImg} />
              {uploadingImg ? <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-500">رفع صورة</span></>}
            </label>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">العنوان <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الرابط</label>
            <input value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)} dir="ltr" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">الترتيب</label>
            <input type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} min={0} className="w-32 bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => set('isPinned', e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <span className="text-gray-200">إعلان مثبت</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <span className="text-gray-200">نشط</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جارٍ الحفظ...</span> : 'حفظ التغييرات'}
          </button>
          <Link href="/ads" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-center">إلغاء</Link>
        </div>
      </form>
    </div>
  );
}
