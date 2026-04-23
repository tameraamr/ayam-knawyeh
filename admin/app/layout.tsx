import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-arabic",
});

export const metadata: Metadata = {
  title: "ايام كناوية — لوحة الإدارة",
  description: "لوحة تحكم إدارية لتطبيق أخبار ايام كناوية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${notoArabic.variable} font-arabic antialiased bg-gray-950 text-gray-100`}>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                fontFamily: 'var(--font-noto-arabic)',
                direction: 'rtl',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
