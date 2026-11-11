'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Flag, CheckCircle, Pencil, Newspaper, Megaphone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ReportGroup } from '@/lib/types';

type Tab = 'open' | 'resolved';

export default function ReportsPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('open');
  const [reports, setReports] = useState<ReportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient.get(`/api/reports?status=${tab}`, token);
      setReports(data.reports);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في جلب البلاغات');
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (r: ReportGroup) => {
    setResolving(r.targetId);
    try {
      await apiClient.post('/api/reports/resolve', { targetType: r.targetType, targetId: r.targetId }, token!);
      toast.success('تم تعليم البلاغ كمُعالَج');
      setReports(prev => prev.filter(x => x.targetId !== r.targetId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في التحديث');
    } finally {
      setResolving(null);
    }
  };

  const editHref = (r: ReportGroup) => r.targetType === 'article' ? `/articles/${r.targetId}/edit` : `/ads/${r.targetId}/edit`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">البلاغات</h1>
        <p className="text-gray-400 mt-1">ما أبلغ عنه القرّاء من التطبيق. راجع المحتوى، عدّله أو احذفه، ثم علّم البلاغ كمُعالَج.</p>
      </div>

      <div className="flex gap-2">
        {([['open', 'بانتظار المراجعة'], ['resolved', 'تمت معالجتها']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === key ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Flag className="w-10 h-10 mx-auto mb-3 opacity-40" />
            {tab === 'open' ? 'لا توجد بلاغات جديدة.' : 'لا توجد بلاغات معالَجة بعد.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {reports.map(r => (
              <li key={`${r.targetType}-${r.targetId}`} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {r.targetType === 'article' ? <Newspaper className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                    {r.targetType === 'article' ? 'خبر' : 'إعلان'}
                    <span className="text-red-400 font-semibold">{r.count} {r.count === 1 ? 'بلاغ' : 'بلاغات'}</span>
                    <span>· آخر بلاغ {new Date(r.lastAt).toLocaleDateString('ar')}</span>
                  </div>
                  <div className="font-medium text-white line-clamp-1">{r.targetTitle || '(بدون عنوان)'}</div>
                  {r.reasons.length > 0 && (
                    <ul className="text-sm text-gray-400 list-disc pr-5">
                      {r.reasons.map((reason, i) => <li key={i} className="line-clamp-2">{reason}</li>)}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={editHref(r)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-gray-800 text-gray-200 hover:bg-gray-700">
                    <Pencil className="w-4 h-4" /> فتح وتعديل
                  </Link>
                  {tab === 'open' && (
                    <button
                      onClick={() => resolve(r)}
                      disabled={resolving === r.targetId}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> تمت المعالجة
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
