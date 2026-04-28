const express = require('express');
const Ad = require('../models/Ad');
const authMiddleware = require('../middleware/auth');
const { sendPushNotifications } = require('../services/expoPush');
const PushToken = require('../models/PushToken');

const router = express.Router();

// GET /api/ads — active ads (public)
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ ads });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الإعلانات' });
  }
});

// GET /api/ads/all — all ads for admin (protected)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ order: 1, createdAt: -1 });
    res.json({ ads });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الإعلانات' });
  }
});

// POST /api/ads — create (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, content, imageUrl, videoUrl, linkUrl, isPinned, isActive, order } = req.body;

    const ad = await Ad.create({ title, description, content, imageUrl, videoUrl, linkUrl, isPinned, isActive, order: order || 0 });
    
    res.status(201).json({ ad });

    // Send push notification to all subscribers if requested
    if (req.body.sendNotification) {
      try {
        const tokenDocs = await PushToken.find({ active: true });
        const tokens = tokenDocs.map(doc => doc.token);
        if (tokens.length > 0) {
          await sendPushNotifications(
            tokens,
            '📢 ' + ad.title,
            ad.description || 'إعلان جديد',
            { adId: ad._id.toString() }
          );
          console.log(`📨 Ad notification sent to ${tokens.length} devices`);
        }
      } catch (notifErr) {
        console.error('Ad notification error:', notifErr);
      }
    }
  } catch (err) {
    res.status(500).json({ error: 'خطأ في إنشاء الإعلان' });
  }
});

// PUT /api/ads/:id — update (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!ad) return res.status(404).json({ error: 'الإعلان غير موجود' });
    res.json({ ad });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحديث الإعلان' });
  }
});

// DELETE /api/ads/:id — delete (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ error: 'الإعلان غير موجود' });
    res.json({ message: 'تم حذف الإعلان بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في حذف الإعلان' });
  }
});

module.exports = router;
