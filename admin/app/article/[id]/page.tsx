import { Metadata } from 'next';
import RedirectClient from './RedirectClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ayam-knawyeh-production.up.railway.app';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/articles/${id}`);
    const data = await res.json();
    const article = data.article;
    
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
      }
    };
  } catch (e) {
    return { title: 'أيام كناوية' };
  }
}

export default async function ArticleDeepLinkPage({ params }: Props) {
  const { id } = await params;
  return <RedirectClient articleId={id} />;
}
