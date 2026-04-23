# Ayam Knawyeh (أيام كناوية)

A comprehensive local news and community platform designed for high performance, ease of use, and rich media delivery. The project is built as a modern full-stack monorepo, featuring a native mobile app, a secure admin dashboard, and a robust backend.

## 🏗️ Architecture Overview

This repository is structured as a monorepo containing three distinct applications:

1. **`mobile/`** - **React Native (Expo)**
   - The user-facing mobile application available for iOS and Android.
   - Features a custom dynamic UI, rich HTML article rendering, embedded video players, and real-time push notifications.
   - Fully compliant with Apple App Store & Google Play UGC moderation guidelines.

2. **`admin/`** - **Next.js (React)**
   - A secure, web-based Admin Dashboard used by journalists and moderators.
   - Features a rich-text editor (TipTap), image uploads, and real-time news management.
   - Styled with TailwindCSS for a premium, responsive desktop experience.

3. **`backend/`** - **Node.js (Express) & MongoDB**
   - The core REST API serving both the mobile app and the admin dashboard.
   - Built with Express.js, featuring JWT authentication, file uploads, and Firebase Cloud Messaging (FCM) integration for pushing real-time alerts.

## 🚀 Tech Stack

- **Mobile:** React Native, Expo Router, Expo AV (Video), React Native WebView
- **Frontend (Admin):** Next.js 15, React 19, TailwindCSS, Lucide Icons, TipTap Editor
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), Firebase Admin SDK
- **Database:** MongoDB Atlas

## 🛠️ Local Development Setup

To run this project locally, you will need Node.js and MongoDB installed.

### 1. Clone the repository
```bash
git clone https://github.com/tameraamr/ayam-knawyeh.git
cd ayam-knawyeh
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory using the provided `.env.example` template. You will need to provide your own MongoDB URI, JWT Secret, and Firebase Service Account credentials.
```bash
npm run dev
```
*The backend will start on `http://localhost:5000`*

### 3. Admin Dashboard Setup
Open a new terminal and navigate to the admin directory:
```bash
cd admin
npm install
npm run dev
```
*The admin dashboard will start on `http://localhost:3000`*

### 4. Mobile App Setup
Open a third terminal and navigate to the mobile directory:
```bash
cd mobile
npm install
npm start
```
*Use the Expo Go app on your physical device, or run an iOS Simulator / Android Emulator to view the app.*

## 🛡️ Security & Privacy
- **Environment Variables:** All sensitive keys (MongoDB URIs, Firebase secrets, JWT tokens) are strictly excluded via `.gitignore`. 
- **Content Moderation:** The platform features built-in reporting mechanisms on both articles and advertisements to ensure a safe community environment.

## 📄 License
All rights reserved. Proprietary software.
