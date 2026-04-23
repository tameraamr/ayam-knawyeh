import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">سياسة الخصوصية</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            مرحباً بك في تطبيق <span className="font-bold text-red-600">أيام كناوية</span>. 
            نحن نحترم خصوصيتك ونلتزم بحماية أي معلومات قد تشاركها معنا.
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. جمع المعلومات</h2>
            <p>
              تطبيق أيام كناوية هو تطبيق إخباري مخصص لقراءة الأخبار ومتابعة الإعلانات. 
              نحن <strong>لا نجمع</strong> أي بيانات شخصية (مثل الاسم، البريد الإلكتروني، أو رقم الهاتف) حيث أن التطبيق لا يتطلب تسجيل الدخول.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. الأذونات المطلوبة</h2>
            <p>
              قد يطلب التطبيق الوصول إلى الإنترنت لجلب آخر الأخبار. لا نطلب أي صلاحيات إضافية غير ضرورية لعمل التطبيق.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. الإبلاغ عن المحتوى</h2>
            <p>
              نحن نوفر ميزة "الإبلاغ عن المحتوى" للمستخدمين لضمان بيئة آمنة وخالية من أي محتوى مسيء. 
              عند الإبلاغ عن مقال أو إعلان، يقوم فريقنا بمراجعة الطلب يدوياً.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. التغييرات على هذه السياسة</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500">
            آخر تحديث: أبريل 2026
          </div>
        </div>
      </div>
    </div>
  );
}
