const express = require('express');
const authMiddleware = require('../middleware/auth');
const { sendPushNotifications } = require('../services/expoPush');
const PushToken = require('../models/PushToken');
const Article = require('../models/Article');
const Ad = require('../models/Ad');

const router = express.Router();

// POST /api/notifications/send — send push to all subscribed users (admin)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { title, body, articleId } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });
    }

    // Fetch all active tokens from the database
    const tokenDocs = await PushToken.find({ active: true });
    const tokens = tokenDocs.map(doc => doc.token);

    if (tokens.length === 0) {
      return res.json({ success: false, message: 'لا يوجد مشتركين حاليا' });
    }

    const data = {};
    if (articleId) data.articleId = articleId;

    const result = await sendPushNotifications(tokens, title, body, data);
    
    console.log(`📨 Notification sent to ${tokens.length} devices`);
    res.json({ ...result, subscriberCount: tokens.length });
  } catch (err) {
    console.error('Notification send error:', err);
    res.status(500).json({ error: 'خطأ في إرسال الإشعار' });
  }
});

// GET /api/notifications/stats — dashboard stats (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalArticles, publishedArticles, totalAds, activeAds, totalViews, subscriberCount] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      Ad.countDocuments(),
      Ad.countDocuments({ isActive: true }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      PushToken.countDocuments({ active: true }),
    ]);

    res.json({
      articles: { total: totalArticles, published: publishedArticles },
      ads: { total: totalAds, active: activeAds },
      totalViews: totalViews[0]?.total || 0,
      subscribers: subscriberCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// POST /api/notifications/subscribe (public — called from mobile app)
router.post('/subscribe', async (req, res) => {
  const { token, platform } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    // Upsert: create if not exists, update if exists
    await PushToken.findOneAndUpdate(
      { token },
      { token, platform: platform || 'android', active: true },
      { upsert: true, new: true }
    );
    console.log(`✅ Device subscribed: ${token.substring(0, 20)}...`);
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /api/notifications/unsubscribe (public — called from mobile app)
router.post('/unsubscribe', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    await PushToken.findOneAndUpdate(
      { token },
      { active: false }
    );
    console.log(`🔕 Device unsubscribed: ${token.substring(0, 20)}...`);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

module.exports = router;
