import React from 'react';
import Image from 'next/image';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 p-8 sm:p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-lg mb-6 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="ايام كناوية Logo" 
                width={80} 
                height={80}
                className="object-contain rounded-xl"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">تواصل معنا</h1>
            <p className="text-red-100 text-lg max-w-lg mx-auto">
              نحن في تطبيق <span className="font-bold">أيام كناوية</span> نرحب بتواصلكم معنا. فريقنا متاح دائماً للرد على استفساراتكم واقتراحاتكم.
            </p>
          </div>
        </div>
        
        {/* Contact Info Section */}
        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Email Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">البريد الإلكتروني</p>
                <a href="mailto:mohammadaboallotfe@gmail.com" className="text-gray-900 font-bold hover:text-red-600 transition-colors break-all">
                  mohammadaboallotfe@gmail.com
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">رقم الهاتف</p>
                <a href="tel:+9720543854441" style={{ direction: 'ltr', display: 'inline-block' }} className="text-gray-900 font-bold hover:text-red-600 transition-colors">
                  +972 054-385-4441
                </a>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md md:col-span-2">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">واتساب (WhatsApp)</p>
                <a href="https://wa.me/972543854441" target="_blank" rel="noopener noreferrer" style={{ direction: 'ltr', display: 'inline-block' }} className="text-gray-900 font-bold hover:text-green-600 transition-colors">
                  +972 054-385-4441
                </a>
                <p className="text-sm text-gray-500 mt-1">اضغط هنا للتواصل معنا مباشرة عبر واتساب</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md md:col-span-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">الموقع</p>
                <p className="text-gray-900 font-bold">
                  كفركنا، الجليل الأسفل
                </p>
              </div>
            </div>

          </div>
          
          <div className="pt-10 mt-10 border-t border-gray-100 text-sm text-gray-500 text-center font-medium">
            تطبيق أيام كناوية - جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
          </div>
        </div>

      </div>
    </div>
  );
}
