'use client';

// "Open in the app" button for people who already have the app.
// No automatic redirect: on a phone without the app, a custom-scheme redirect
// shows an error page. With app links set up, phones that have the app open it
// before ever reaching this page.
export default function OpenInAppButton({ articleId }: { articleId: string }) {
  return (
    <a
      href={`ayamknawyeh://article/${articleId}`}
      className="block w-full rounded-xl bg-[#8c1222] text-white font-bold py-3.5 hover:bg-[#6e0d1a] transition-colors"
    >
      لديك التطبيق؟ افتح الخبر فيه
    </a>
  );
}
