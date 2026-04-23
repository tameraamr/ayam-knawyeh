import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">شروط الاستخدام</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            مرحباً بك في تطبيق <span className="font-bold text-red-600">أيام كناوية</span>. 
            باستخدامك لهذا التطبيق، فإنك توافق على الشروط والأحكام التالية:
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. استخدام التطبيق</h2>
            <p>
              يُسمح باستخدام هذا التطبيق للأغراض الشخصية فقط والاطلاع على أخبار البلدة. 
              يُمنع استخدام التطبيق لأي غرض غير قانوني أو ضار.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. المحتوى الذي ينشئه المستخدم</h2>
            <p>
              بما أن التطبيق يعرض أخباراً وإعلانات مجتمعية، فإننا نتخذ موقفاً صارماً ضد المحتوى المسيء. 
              <strong>لا يوجد أي تسامح</strong> مع المحتوى المرفوض أو المستخدمين المسيئين. سيتم إزالة أي محتوى ينتهك هذه الشروط فوراً.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. آلية الإبلاغ</h2>
            <p>
              يجب على المستخدمين الإبلاغ عن أي محتوى يرونه مسيئاً عبر زر "إبلاغ" الموجود داخل كل مقال وإعلان. 
              سنتخذ إجراءات فورية قد تشمل إزالة المحتوى المخالف وحظر الناشر من استخدام خدماتنا.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. إخلاء المسؤولية</h2>
            <p>
              التطبيق مقدم "كما هو" دون أي ضمانات. نحن غير مسؤولين عن دقة الأخبار المنشورة أو أي أضرار ناتجة عن استخدام التطبيق.
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
