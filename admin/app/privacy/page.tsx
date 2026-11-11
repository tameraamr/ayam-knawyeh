import React from 'react';
import Link from 'next/link';

// Keep this page in sync with what the app really collects (mobile/lib/*.ts) and
// with the "Data safety" (Google Play) and "App Privacy" (App Store) forms.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. لا نطلب أي بيانات شخصية',
    body: (
      <p>
        لا يحتاج التطبيق إلى تسجيل دخول، ولا نطلب منك اسمك أو بريدك الإلكتروني أو رقم هاتفك، ولا نستخدم موقعك الجغرافي.
      </p>
    ),
  },
  {
    title: '2. ما الذي يرسله التطبيق إلى خوادمنا',
    body: (
      <ul className="list-disc pr-6 space-y-2">
        <li>
          <strong>رمز الإشعارات:</strong> رمز تقني تمنحه Apple أو Google لهاتفك، مع نوع النظام (iOS أو Android)
          والتصنيفات التي اخترت أن تصلك إشعاراتها. نستخدمه فقط لإرسال إشعارات الأخبار، ويتوقف استخدامه عند إيقاف الإشعارات.
        </li>
        <li>
          <strong>معرّف مجهول للجهاز:</strong> رقم عشوائي ينشئه التطبيق عند أول استخدام، ولا يرتبط بهويتك أو بأي معرّف
          في هاتفك. نستخدمه لاحتساب مشاهدة واحدة لكل خبر من كل هاتف، ولمنع تكرار البلاغات.
        </li>
        <li>
          <strong>البلاغات:</strong> عند استخدام زر «إبلاغ» نحفظ الخبر أو الإعلان المُبلَّغ عنه، والسبب الذي اخترته،
          والمعرّف المجهول، ليراجعها فريق التحرير يدوياً.
        </li>
        <li>
          <strong>تقارير الأعطال:</strong> إذا توقف التطبيق بسبب خطأ، تُرسل معلومات تقنية عن الخطأ (نوع الجهاز، إصدار النظام
          وإصدار التطبيق والشاشة التي حدث فيها الخطأ) لنتمكن من إصلاحه. لا تتضمن هذه التقارير أي بيانات شخصية.
        </li>
      </ul>
    ),
  },
  {
    title: '3. ما يبقى على هاتفك فقط',
    body: (
      <p>
        إعداداتك (تشغيل الإشعارات، التصنيفات المختارة، حجم الخط) وعدد الأخبار التي قرأتها — لنعرض طلب تقييم التطبيق في وقت
        مناسب — تُحفظ على هاتفك ولا تُرسل إلينا. أما مواقيت الصلاة فتُحسب على الهاتف حسب موقع كفركنا الثابت، دون استخدام موقعك.
      </p>
    ),
  },
  {
    title: '4. الخدمات التي نستعين بها',
    body: (
      <p>
        خدمة الإشعارات من Expo وApple وGoogle، وSentry لتقارير الأعطال، وخوادم الاستضافة وقاعدة البيانات (Railway وMongoDB Atlas)
        وخدمة الصور Cloudinary. تعالج هذه الخدمات البيانات المذكورة أعلاه فقط ولغرض تشغيل التطبيق.
      </p>
    ),
  },
  {
    title: '5. الأذونات',
    body: (
      <p>
        يحتاج التطبيق إلى الإنترنت لجلب الأخبار. إذن الإشعارات اختياري، ويمكنك إيقافه في أي وقت من إعدادات التطبيق أو الهاتف.
      </p>
    ),
  },
  {
    title: '6. الإبلاغ عن المحتوى',
    body: (
      <p>
        نوفر زر «إبلاغ» في كل خبر وإعلان. يراجع فريقنا كل بلاغ يدوياً، ويعدّل أو يحذف المحتوى المخالف.
      </p>
    ),
  },
  {
    title: '7. حذف البيانات والتواصل',
    body: (
      <p>
        لا نحتفظ بأي بيانات تعرّف بك. إذا أردت حذف رمز الإشعارات، أوقف الإشعارات من التطبيق أو احذفه. لأي سؤال
        {' '}<Link href="/contact" className="text-red-700 underline">تواصل معنا</Link>.
      </p>
    ),
  },
  {
    title: '8. التغييرات على هذه السياسة',
    body: <p>قد نحدّث هذه السياسة عند إضافة ميزات جديدة، وتُنشر أي تغييرات على هذه الصفحة.</p>,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">سياسة الخصوصية</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            مرحباً بك في تطبيق <span className="font-bold text-red-600">أيام كناوية</span>.
            نحترم خصوصيتك، وتشرح هذه الصفحة بوضوح ما يجمعه التطبيق ولماذا.
          </p>

          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
              {s.body}
            </div>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500">
            آخر تحديث: نوفمبر 2026
          </div>
        </div>
      </div>
    </div>
  );
}
