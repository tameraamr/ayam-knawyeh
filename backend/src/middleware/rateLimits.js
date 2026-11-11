const { rateLimit } = require('express-rate-limit');

// Limits are per IP. Mobile carriers put many phones behind one IP (CGNAT), so
// limits on what normal readers do are generous; they only stop floods.
// Strict limits only where abuse matters: admin login and reports.

const message = (text) => ({ error: text });
const base = { standardHeaders: 'draft-7', legacyHeaders: false };

// Everything under /api: a high ceiling against floods.
const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 1500,
  message: message('طلبات كثيرة جداً، حاول بعد قليل'),
});

// Admin login: slows down password guessing.
const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: message('محاولات دخول كثيرة، حاول بعد 15 دقيقة'),
});

// Public writes from the app: subscribe/unsubscribe, view counting, search.
const appWriteLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 300,
  message: message('طلبات كثيرة جداً، حاول بعد قليل'),
});

// Reports: a real reader sends a few, not dozens.
const reportLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: message('تم إرسال بلاغات كثيرة، حاول لاحقاً'),
});

module.exports = { apiLimiter, loginLimiter, appWriteLimiter, reportLimiter };
