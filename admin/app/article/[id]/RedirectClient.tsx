'use client';

import { useEffect, useState } from 'react';

export default function RedirectClient({ articleId }: { articleId: string }) {
  const [failed, setFailed] = useState(false);
  const appUrl = `ayamknawyeh://article/${articleId}`;

  useEffect(() => {
    // Attempt redirect immediately
    window.location.href = appUrl;
    
    // If we're still here after 1.5 seconds, show the fallback button
    const timer = setTimeout(() => {
      setFailed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [appUrl]);

  return (
    <div className="min-h-screen bg-[#0c0101] flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-[#1a0505] border border-[#8b0000]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <h1 className="text-white text-2xl font-bold mb-2">جاري فتح التطبيق...</h1>
        <p className="text-gray-400 mb-8 text-sm">إذا لم يفتح التطبيق تلقائياً، اضغط على الزر أدناه</p>
        
        <a 
          href={appUrl}
          className="block w-full bg-[#e62020] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/50 hover:bg-red-600 transition-colors"
        >
          فتح الخبر في التطبيق
        </a>

        {failed && (
          <p className="mt-6 text-xs text-gray-500">
            * يجب أن يكون تطبيق أيام كناوية مثبتاً على جهازك
          </p>
        )}
      </div>
    </div>
  );
}
