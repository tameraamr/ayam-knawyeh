# ايام كناوية — تطبيق الأخبار

تطبيق إخباري احترافي متكامل يشمل:
- **backend/** — واجهة برمجية (Node.js + Express + MongoDB)
- **admin/** — لوحة إدارة ويب (Next.js 14، عربي RTL)
- **mobile/** — تطبيق جوال (React Native + Expo، Android & iOS)

---

## 🚀 التشغيل السريع

### 1. الخادم الخلفي (Backend)

**المتطلبات:** Node.js 18+، MongoDB (اخبار البلد أو Atlas)

```bash
cd backend
cp .env.example .env
# عدّل MONGODB_URI في ملف .env
npm install
npm run dev
```

> الخادم يعمل على: `http://localhost:5000`  
> بيانات المدير الافتراضية: **admin / admin123**

---

### 2. لوحة الإدارة (Admin Panel)

```bash
cd admin
npm install
npm run dev
```

> تعمل على: `http://localhost:3000`  
> سجّل الدخول بـ admin / admin123

---

### 3. التطبيق الجوال (Mobile App)

**المتطلبات:** Node.js 18+، Expo CLI، Android Studio أو Xcode

```bash
cd mobile
npm install
npx expo start
```

ثم:
- اضغط `a` لفتحه في محاكي Android
- أو امسح QR Code بتطبيق Expo Go على هاتفك

> **ملاحظة:** تأكد أن الخادم يعمل على `localhost:5000`

---

## 🔥 إعداد Firebase (الإشعارات)

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. أنشئ مشروعاً جديداً
3. **للخادم:**
   - Project Settings → Service Accounts → Generate new private key
   - انسخ القيم إلى `backend/.env`
4. **لتطبيق Android:**
   - أضف تطبيق Android (package: `com.ayamknawyeh.app`)
   - حمّل `google-services.json` وضعه في `mobile/`
5. **لتطبيق iOS:**
   - أضف تطبيق iOS (Bundle ID: `com.ayamknawyeh.app`)
   - حمّل `GoogleService-Info.plist` وضعه في `mobile/`

---

## 🌐 النشر على Railway (Backend)

```bash
cd backend
# أنشئ مشروعاً جديداً على railway.app
# أضف متغيرات البيئة من .env.example
# اربط مستودع GitHub بالمشروع
```

بعد النشر، حدّث:
- `admin/.env.local`: `NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app`
- `mobile/.env`: `EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app`

---

## 📁 هيكل المشروع

```
ayam-knawyeh/
├── backend/
│   ├── src/
│   │   ├── index.js          ← نقطة البداية
│   │   ├── models/           ← Article, Ad, Admin
│   │   ├── routes/           ← API endpoints
│   │   ├── middleware/        ← JWT auth
│   │   ├── services/         ← Firebase FCM
│   │   └── utils/            ← Seed admin
│   ├── uploads/              ← مجلد الصور (يُنشأ تلقائياً)
│   └── .env
├── admin/
│   ├── app/
│   │   ├── login/            ← صفحة تسجيل الدخول
│   │   └── (dashboard)/      ← الصفحات المحمية
│   │       ├── dashboard/    ← الإحصائيات
│   │       ├── articles/     ← إدارة الأخبار
│   │       ├── ads/          ← إدارة الإعلانات
│   │       └── notifications/ ← إرسال الإشعارات
│   └── components/
│       ├── Sidebar.tsx
│       └── TipTapEditor.tsx
└── mobile/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── index.tsx     ← الرئيسية (الأخبار)
    │   │   ├── categories.tsx ← التصنيفات
    │   │   └── settings.tsx  ← الإعدادات
    │   └── article/[id].tsx  ← تفاصيل الخبر
    └── lib/
        ├── api.ts
        └── notifications.ts
```

---

## 🔑 API Endpoints

| Method | URL | الوصف | الصلاحية |
|--------|-----|-------|---------|
| POST | `/api/auth/login` | تسجيل الدخول | عام |
| GET | `/api/articles` | قائمة الأخبار | عام |
| GET | `/api/articles/:id` | خبر محدد | عام |
| POST | `/api/articles` | إضافة خبر | مدير |
| PUT | `/api/articles/:id` | تعديل خبر | مدير |
| DELETE | `/api/articles/:id` | حذف خبر | مدير |
| GET | `/api/ads` | الإعلانات النشطة | عام |
| POST | `/api/ads` | إضافة إعلان | مدير |
| PUT | `/api/ads/:id` | تعديل إعلان | مدير |
| DELETE | `/api/ads/:id` | حذف إعلان | مدير |
| POST | `/api/upload` | رفع صورة | مدير |
| POST | `/api/notifications/send` | إرسال إشعار | مدير |
| GET | `/api/notifications/stats` | إحصائيات | مدير |
