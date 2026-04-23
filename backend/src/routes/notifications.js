const express = require('express');
const authMiddleware = require('../middleware/auth');
const { sendToAll } = require('../services/fcm');
const Article = require('../models/Article');
const Ad = require('../models/Ad');

const router = express.Router();

// POST /api/notifications/send — send push to all users (admin)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { title, body, articleId } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });
    }

    const data = {};
    if (articleId) data.articleId = articleId;

    const result = await sendToAll(title, body, data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في إرسال الإشعار' });
  }
});

// GET /api/notifications/stats — dashboard stats (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalArticles, publishedArticles, totalAds, activeAds, totalViews] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      Ad.countDocuments(),
      Ad.countDocuments({ isActive: true }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    res.json({
      articles: { total: totalArticles, published: publishedArticles },
      ads: { total: totalAds, active: activeAds },
      totalViews: totalViews[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

module.exports = router;
