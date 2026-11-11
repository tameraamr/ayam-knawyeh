import { cache } from 'react';
import { Metadata } from 'next';
import OpenInAppButton from './RedirectClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ayam-knawyeh-production.up.railway.app';
const APP_STORE_URL = 'https://apps.apple.com/app/id6763949906';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ayamknawyeh.app';

type Props = {
  params: Promise<{ id: string }>;
};

type SharedArticle = {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  createdAt: string;
};

// Fetched once per request for both the link preview (metadata) and the page.
// noview=1: link previews (WhatsApp, Facebook…) and visitors here don't count as app views.
const getArticle = cache(async (id: string): Promise<SharedArticle | null> => {
  try {
    const res = await fetch(`${API_URL}/api/articles/${encodeURIComponent(id)}?noview=1`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.article ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'أيام كناوية' };

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

// The page people land on from a shared link. With the app installed and app links
// set up, the phone opens the app directly; everyone else sees the news here and
// can download the app.
export default async function SharedArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  return (
    <main className="min-h-screen bg-[#efede8] text-[#1f1819]" dir="rtl">
      <header className="bg-[#8c1222] border-b-[3px] border-[#c9a24a] py-4 flex justify-center">
        <img src="/logo.png" alt="أيام كناوية" className="h-16 w-auto" />
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {article ? (
          <article className="bg-white rounded-2xl overflow-hidden">
            {article.imageUrl && (
              <img src={article.imageUrl} alt="" className="w-full aspect-[16/10] object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-[#6c625e]">
                <span className="px-2 py-0.5 rounded-md bg-[#8c1222]/10 text-[#8c1222] font-semibold">{article.category}</span>
                <time>{new Date(article.createdAt).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
              </div>
              <h1 className="text-2xl font-bold leading-snug text-balance">{article.title}</h1>
              {article.description && <p className="text-[#6c625e] leading-8">{article.description}</p>}
            </div>
          </article>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <h1 className="text-xl font-bold mb-2">الخبر غير متوفر</h1>
            <p className="text-[#6c625e]">ربما تم حذف هذا الخبر. حمّل التطبيق لقراءة آخر أخبار كفركنا.</p>
          </div>
        )}

        <section className="bg-white rounded-2xl p-5 space-y-3 text-center">
          <h2 className="font-bold text-lg">اقرأ الخبر كاملاً في تطبيق أيام كناوية</h2>
          <p className="text-sm text-[#6c625e]">أخبار كفركنا أولاً بأول، مع إشعارات للأخبار العاجلة.</p>
          {article && <OpenInAppButton articleId={article._id} />}
          <div className="grid grid-cols-2 gap-3">
            <a href={APP_STORE_URL} className="rounded-xl bg-[#1f1819] text-white py-3 font-semibold">App Store</a>
            <a href={PLAY_STORE_URL} className="rounded-xl bg-[#1f1819] text-white py-3 font-semibold">Google Play</a>
          </div>
        </section>
      </div>
    </main>
  );
}
