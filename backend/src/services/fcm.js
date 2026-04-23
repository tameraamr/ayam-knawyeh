/**
 * Firebase Cloud Messaging Service
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or use existing)
 * 3. Go to Project Settings > Service Accounts
 * 4. Click "Generate new private key" and download the JSON file
 * 5. Copy values from the JSON into your .env file:
 *    - FIREBASE_PROJECT_ID = project_id
 *    - FIREBASE_PRIVATE_KEY = private_key (the full -----BEGIN PRIVATE KEY----- string)
 *    - FIREBASE_CLIENT_EMAIL = client_email
 */

let firebaseAdmin = null;
let fcmInitialized = false;

const initFirebase = () => {
  if (fcmInitialized) return firebaseAdmin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail || 
      projectId === 'your_firebase_project_id') {
    console.warn('⚠️  Firebase not configured. Push notifications will be disabled.');
    console.warn('   See backend/src/services/fcm.js for setup instructions.');
    fcmInitialized = true;
    return null;
  }

  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
    }
    firebaseAdmin = admin;
    fcmInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
    return admin;
  } catch (err) {
    console.error('❌ Firebase init error:', err.message);
    fcmInitialized = true;
    return null;
  }
};

/**
 * Send a push notification to all subscribers (/topics/all)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data payload
 */
const sendToAll = async (title, body, data = {}) => {
  const admin = initFirebase();
  if (!admin) {
    return { success: false, message: 'Firebase not configured' };
  }

  try {
    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      topic: 'all',
    };
    const response = await admin.messaging().send(message);
    console.log(`📨 Notification sent: ${response}`);
    return { success: true, messageId: response };
  } catch (err) {
    console.error('FCM send error:', err.message);
    return { success: false, message: err.message };
  }
};

module.exports = { sendToAll, initFirebase };
