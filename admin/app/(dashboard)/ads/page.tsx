'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { Ad } from '@/lib/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Pin } from 'lucide-react';

export default function AdsPage() {
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAds = async () => {
    if (!token) return;
    try {
      const data = await apiClient.get('/api/ads/all', token);
      setAds(data.ads);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في جلب الإعلانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, [token]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/ads/${id}`, token!);
      toast.success('تم حذف الإعلان');
      setAds(prev => prev.filter(a => a._id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      const updated = await apiClient.put(`/api/ads/${ad._id}`, { isActive: !ad.isActive }, token!);
      setAds(prev => prev.map(a => a._id === ad._id ? updated.ad : a));
      toast.success(ad.isActive ? 'تم إيقاف الإعلان' : 'تم تفعيل الإعلان');
    } catch {
      toast.error('خطأ في تحديث الإعلان');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الإعلانات</h1>
          <p className="text-gray-400 mt-1">{ads.length} إعلان</p>
        </div>
        <Link href="/ads/new" className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-900/30">
          <Plus className="w-5 h-5" />
          إعلان جديد
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-4 animate-pulse">
              <div className="h-40 bg-gray-800 rounded-xl mb-3" />
              <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          لا توجد إعلانات بعد. أضف أول إعلان!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map(ad => (
            <div key={ad._id} className={`bg-gray-900 border rounded-2xl overflow-hidden transition-colors ${ad.isActive ? 'border-gray-800 hover:border-gray-700' : 'border-gray-800 opacity-60'}`}>
              {/* Image */}
              {ad.imageUrl ? (
                <div className="h-40 overflow-hidden">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-purple-900/30 to-purple-800/10 flex items-center justify-center">
                  <Pin className="w-12 h-12 text-purple-700" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white">{ad.title}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {ad.isPinned && <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">مثبت</span>}
                  </div>
                </div>
                {ad.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{ad.description}</p>}

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <button
                    onClick={() => toggleActive(ad)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${ad.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {ad.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {ad.isActive ? 'نشط' : 'موقوف'}
                  </button>
                  <div className="flex items-center gap-2">
                    <Link href={`/ads/${ad._id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(ad._id, ad.title)}
                      disabled={deletingId === ad._id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === ad._id
                        ? <span className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin block" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
