import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">اتصل بنا</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            نحن في تطبيق <span className="font-bold text-red-600">أيام كناوية</span> نرحب بتواصلكم معنا لأي استفسارات، اقتراحات، أو للإبلاغ عن أي مشاكل تواجهكم.
          </p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الاتصال</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">البريد الإلكتروني</p>
                  <a href="mailto:tameraamr@gmail.com" className="text-lg font-medium text-gray-900 hover:text-red-600 transition-colors">
                    tameraamr@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500 text-center">
            تطبيق أيام كناوية - جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  );
}
