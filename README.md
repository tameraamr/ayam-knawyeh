# أيام كناوية — Ayam Knawyeh

> **A full-stack, production-ready Arabic news & community platform** — built as a monorepo with a cross-platform mobile app, a secure admin CMS, and a scalable REST API backend.

<br/>

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack & Skills](#-tech-stack--skills)
  - [Mobile App (React Native / Expo)](#mobile-app--react-native--expo)
  - [Admin Dashboard (Next.js)](#admin-dashboard--nextjs)
  - [Backend API (Node.js / Express)](#backend-api--nodejs--express)
  - [Cloud & DevOps](#cloud--devops)
- [Key Features](#-key-features)
- [Screens & Modules](#-screens--modules)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Local Development Setup](#️-local-development-setup)
- [Build & Deployment](#-build--deployment)
- [Security & Privacy](#-security--privacy)
- [License](#-license)

<br/>

---

## 📖 Project Overview

**Ayam Knawyeh (أيام كناوية)** is a full-stack, Arabic-first local news and community platform. It was designed from the ground up to serve a regional Arabic-speaking audience with a native mobile experience on both Android and iOS, a web-based content management system for journalists, and a cloud-powered API backend.

The project is structured as a **monorepo** containing three independently deployable applications that share a common API contract.

<br/>

---

## 🏗️ Architecture

```
ayam-knawyeh/
├── mobile/        # Cross-platform mobile app (React Native + Expo)
├── admin/         # Web-based CMS / Admin Dashboard (Next.js 16)
└── backend/       # REST API server (Node.js + Express + MongoDB)
```

```
                    ┌─────────────────────────────────┐
                    │         Mobile App               │
                    │   React Native (Expo) — iOS/Android│
                    └──────────────┬──────────────────┘
                                   │ HTTP REST
                    ┌──────────────▼──────────────────┐
                    │         Backend API               │
                    │  Node.js + Express + MongoDB      │
                    │  Firebase Admin (FCM Push Notif.) │
                    │  Cloudinary (Image CDN)           │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │      Admin Dashboard (CMS)        │
                    │       Next.js 16 + TailwindCSS   │
                    └─────────────────────────────────┘
```

<br/>

---

## 🛠️ Tech Stack & Skills

### Mobile App — React Native / Expo

| Category | Technology / Library | Version | Purpose |
|---|---|---|---|
| **Framework** | React Native | 0.81.5 | Cross-platform native mobile development |
| **Toolchain** | Expo | ~54.0 | Managed workflow, native modules, dev tooling |
| **Language** | TypeScript | ~5.9 | Type-safe development across all mobile code |
| **Navigation** | Expo Router | ~6.0 | File-based routing & deep linking |
| **UI / Styling** | React Native StyleSheet | — | Native styling with RTL (Arabic) layout support |
| **Animations** | React Native Reanimated | ~4.1 | High-performance 60fps gesture & layout animations |
| **Gestures** | React Native Gesture Handler | ~2.28 | Native swipe, tap, and scroll gestures |
| **Video** | Expo AV (`expo-av`) | ~16.0 | Embedded video playback in article feeds |
| **HTML Rendering** | React Native WebView | 13.15 | Rich HTML article rendering inside native views |
| **Icons** | @expo/vector-icons | ^15.0 | Ionicons, MaterialIcons, and more |
| **Gradients** | Expo Linear Gradient | ~15.0 | Visual gradient UI elements |
| **Push Notifications** | Expo Notifications | ~0.32 | Device token registration & notification handling |
| **Storage** | AsyncStorage | 2.2.0 | Persistent local storage for tokens and settings |
| **Localization** | Expo Localization | ~17.0 | Arabic locale detection and RTL layout forcing |
| **Safe Areas** | React Native Safe Area Context | ~5.6 | Notch/inset-aware layouts on all devices |
| **Screens** | React Native Screens | ~4.16 | Native screen transitions and memory management |
| **Build Service** | EAS Build (Expo Application Services) | ≥18.8 | Cloud-based APK / AAB / IPA generation |
| **OTA Updates** | Expo Updates | ~29.0 | Over-the-air JS bundle updates post-publish |

**Key Mobile Skills Demonstrated:**
- File-based routing with Expo Router (tabs, stack, deep links)
- RTL (Right-to-Left) layout enforcement for Arabic UX (`supportsRtl`, `forcesRtl`)
- FCM push notification registration and foreground/background handling
- Adaptive app icons and splash screen configuration for Android & iOS
- Multi-platform build pipelines with EAS (APK, AAB, IPA)
- Typed routes with TypeScript (`experiments.typedRoutes`)
- Dark mode UI with custom dark theme throughout

---

### Admin Dashboard — Next.js

| Category | Technology / Library | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js | 16.2 | Server-side rendered React CMS |
| **Language** | TypeScript | ^5 | Type-safe frontend code |
| **UI Library** | React | 19.2 | Component-based UI |
| **Styling** | TailwindCSS | ^4 | Utility-first responsive styling |
| **CSS Processing** | PostCSS | — | Tailwind CSS transformation pipeline |
| **Rich Text Editor** | TipTap | ^3.22 | WYSIWYG article editor (ProseMirror-based) |
| **TipTap Extensions** | `extension-image`, `extension-link`, `extension-text-align`, `extension-underline` | ^3.22 | Extended formatting capabilities |
| **HTTP Client** | Axios | ^1.15 | Typed API communication with the backend |
| **Icons** | Lucide React | ^1.8 | Clean, consistent icon set |
| **Notifications** | React Hot Toast | ^2.6 | Non-blocking in-app success/error alerts |
| **Linting** | ESLint + eslint-config-next | ^9 | Code quality enforcement |

**Key Admin / Frontend Skills Demonstrated:**
- Next.js App Router with nested layouts and route groups
- Building a full WYSIWYG CMS editor with TipTap (rich-text, image embeds, links, alignment)
- Secure authenticated route protection (JWT token validation)
- Responsive dashboard layout with collapsible Sidebar navigation
- Article and advertisement management (Create, Read, Update, Delete)
- Real-time toast feedback for API operations

---

### Backend API — Node.js / Express

| Category | Technology / Library | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | LTS | Server-side JavaScript runtime |
| **Framework** | Express.js | ^4.21 | REST API routing and middleware |
| **Database ODM** | Mongoose | ^8.13 | MongoDB schema modeling and query builder |
| **Database** | MongoDB Atlas | — | Cloud-hosted NoSQL document database |
| **Authentication** | JSON Web Tokens (JWT) via `jsonwebtoken` | ^9.0 | Stateless auth with signed tokens |
| **Password Hashing** | bcryptjs | ^2.4 | Secure password storage with salted hashing |
| **File Uploads** | Multer | ^1.4 | Multipart form-data parsing for image uploads |
| **Cloud Media CDN** | Cloudinary + `multer-storage-cloudinary` | ^1.41 / ^4.0 | Image upload, storage, and optimized delivery |
| **Push Notifications** | Firebase Admin SDK (`firebase-admin`) | ^13.3 | Server-side FCM push notification dispatch |
| **Input Validation** | express-validator | ^7.2 | Request body validation and sanitization |
| **Security Headers** | Helmet | ^8.0 | HTTP security headers (XSS, HSTS, CSP, etc.) |
| **CORS** | cors | ^2.8 | Cross-Origin Resource Sharing policy |
| **HTTP Logging** | Morgan | ^1.10 | HTTP request logging middleware |
| **Environment Config** | dotenv | ^16.4 | `.env` file loading for secret management |
| **ID Generation** | uuid | ^11.1 | Unique identifier generation |
| **Dev Tooling** | Nodemon | ^3.1 | Hot-reload during local backend development |

**Key Backend Skills Demonstrated:**
- RESTful API design with Express Router (auth, articles, ads, notifications, uploads)
- MongoDB schema design with Mongoose (Articles, Ads, Admins models)
- JWT-based authentication with protected middleware (`auth.js`)
- Cloudinary integration for scalable image storage and CDN delivery
- Firebase Cloud Messaging (FCM) server-side integration for push broadcasts
- Helmet-based HTTP security hardening
- Input sanitization and validation with `express-validator`
- Environment-based configuration management

---

### Cloud & DevOps

| Tool / Service | Purpose |
|---|---|
| **MongoDB Atlas** | Fully managed cloud NoSQL database |
| **Cloudinary** | Image CDN — upload, transform, and serve media |
| **Firebase Cloud Messaging (FCM)** | Real-time push notification delivery to mobile devices |
| **Expo Application Services (EAS)** | Cloud-based mobile build & submit pipeline (APK, AAB, IPA) |
| **Git / GitHub** | Version control and source code hosting |
| **dotenv / .gitignore** | Secret management — no sensitive credentials in source |
| **Nodemon** | Hot-reload development server |

<br/>

---

## ✨ Key Features

### Mobile App
- 📰 **Live News Feed** — Paginated Arabic article feed with category filtering
- 🎬 **Embedded Video Player** — Native video playback inside article cards
- 🌐 **Rich HTML Article Renderer** — Full HTML article content via WebView
- 🔔 **Push Notifications** — Real-time breaking news alerts via FCM
- 📂 **Category Browser** — Organized content discovery by news category
- ⚙️ **Settings Screen** — User preferences and app info
- 📢 **Advertisements** — Full-screen ad display with reporting mechanism
- 🛡️ **Content Reporting** — Users can report inappropriate articles or ads
- 🌙 **Dark Mode** — Full dark theme across all screens
- 🔤 **RTL Layout** — Native Right-to-Left Arabic text and UI layout
- 🔗 **Deep Linking** — Custom URL scheme (`ayamknawyeh://`) for direct navigation

### Admin Dashboard (CMS)
- 🔐 **Secure Login** — JWT-authenticated admin access
- ✍️ **Rich Text Editor** — TipTap WYSIWYG with images, links, bold, italic, underline, text alignment
- 📄 **Article Management** — Create, edit, publish, and delete news articles
- 📢 **Ad Management** — Upload and manage advertisement content
- 📁 **Image Uploads** — Direct Cloudinary integration from the editor
- 🔔 **Push Notification Sender** — Broadcast breaking news alerts from the dashboard
- 🧭 **Sidebar Navigation** — Clean, organized dashboard layout

### Backend API
- 🔒 **JWT Authentication** — Secure, stateless auth with token-based protected routes
- 📰 **Articles CRUD** — Full lifecycle management of news articles
- 📢 **Ads CRUD** — Advertisement lifecycle management
- 🖼️ **Image Upload API** — Multer + Cloudinary pipeline for media assets
- 🔔 **FCM Broadcast API** — Server-side push notification dispatch to all registered devices
- 🛡️ **Security Hardened** — Helmet headers, CORS policy, bcrypt password hashing

<br/>

---

## 📱 Screens & Modules

| Screen / Module | Description |
|---|---|
| `app/(tabs)/index.tsx` | Home feed — paginated articles, breaking news highlights |
| `app/(tabs)/categories.tsx` | Category browser for filtering content |
| `app/(tabs)/settings.tsx` | App settings, about page, social links |
| `app/(tabs)/_layout.tsx` | Tab navigator layout with custom dark styling |
| `app/_layout.tsx` | Root layout — push notification token registration |
| `app/article/[id].tsx` | Dynamic article detail page with HTML rendering |
| `app/ad/[id].tsx` | Full-screen advertisement view |

<br/>

---

## 🗂️ Data Models

### Article
```js
{
  title: String,
  content: String,       // Rich HTML content
  category: String,
  imageUrl: String,      // Cloudinary CDN URL
  videoUrl: String,
  author: String,
  publishedAt: Date,
  reports: [{ reason, reportedAt }]
}
```

### Ad (Advertisement)
```js
{
  title: String,
  imageUrl: String,
  linkUrl: String,
  isActive: Boolean,
  reports: [{ reason, reportedAt }]
}
```

### Admin (User)
```js
{
  username: String,
  email: String,
  password: String,      // bcrypt hashed
  role: String
}
```

<br/>

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Admin login → returns JWT |
| `GET` | `/api/articles` | ❌ | Fetch all articles (paginated) |
| `GET` | `/api/articles/:id` | ❌ | Fetch single article |
| `POST` | `/api/articles` | ✅ JWT | Create new article |
| `PUT` | `/api/articles/:id` | ✅ JWT | Update article |
| `DELETE` | `/api/articles/:id` | ✅ JWT | Delete article |
| `POST` | `/api/articles/:id/report` | ❌ | Report an article |
| `GET` | `/api/ads` | ❌ | Fetch all active ads |
| `POST` | `/api/ads` | ✅ JWT | Create new ad |
| `PUT` | `/api/ads/:id` | ✅ JWT | Update ad |
| `DELETE` | `/api/ads/:id` | ✅ JWT | Delete ad |
| `POST` | `/api/ads/:id/report` | ❌ | Report an ad |
| `POST` | `/api/upload` | ✅ JWT | Upload image to Cloudinary |
| `POST` | `/api/notifications/send` | ✅ JWT | Broadcast FCM push notification |

<br/>

---

## 🛠️ Local Development Setup

Requires **Node.js (LTS)** and a **MongoDB** instance.

### 1. Clone the repository
```bash
git clone https://github.com/tameraamr/ayam-knawyeh.git
cd ayam-knawyeh
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file based on `.env.example`:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FIREBASE_SERVICE_ACCOUNT=./path/to/firebase-service-account.json
```
```bash
npm run dev
# Server starts at http://localhost:5000
```

### 3. Admin Dashboard Setup
```bash
cd admin
npm install
npm run dev
# Dashboard starts at http://localhost:3000
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npm start
# Scan the QR code with Expo Go, or launch an Android / iOS emulator
```

<br/>

---

## 🚀 Build & Deployment

The mobile app is distributed via **Expo Application Services (EAS)**.

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Build a preview APK (Android)
eas build --platform android --profile preview

# Build a production AAB (Google Play)
eas build --platform android --profile production

# Build a production IPA (Apple App Store)
eas build --platform ios --profile production
```

EAS configuration is managed in `mobile/eas.json`.

<br/>

---

## 🛡️ Security & Privacy

- **Environment Variables**: All secrets (MongoDB URI, JWT secret, Firebase credentials, Cloudinary keys) are excluded via `.gitignore` and never committed to source control.
- **JWT Authentication**: All sensitive admin endpoints are protected by a JWT middleware. Tokens are signed server-side and validated on every request.
- **Password Security**: Admin passwords are hashed with `bcryptjs` using salted rounds — plaintext passwords are never stored.
- **HTTP Security Headers**: `Helmet` sets strict headers (X-XSS-Protection, HSTS, X-Frame-Options, CSP, etc.) on all API responses.
- **Content Moderation**: Users can report articles and advertisements. Reports are logged in the database and surfaced in the admin dashboard for review.
- **CORS Policy**: API CORS is configured to allow only known origins in production.

<br/>

---

## 📄 License

All rights reserved. Proprietary software — © Tamer Omar.
