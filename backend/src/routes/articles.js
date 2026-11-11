const express = require('express');
const mongoose = require('mongoose');
const Article = require('../models/Article');
const ArticleView = require('../models/ArticleView');
const authMiddleware = require('../middleware/auth');
const { sendPushNotifications } = require('../services/expoPush');
const { getActiveTokens } = require('../services/subscribers');

const router = express.Router();

// GET /api/articles — paginated list (public)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const category = req.query.category;
    const search = req.query.search;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content'),
      Article.countDocuments(query),
    ]);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الأخبار' });
  }
});

// GET /api/articles/all — all articles for admin (protected)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).select('-content');
    res.json({ articles });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الأخبار' });
  }
});

// GET /api/articles/:id — single article (public)
// Views: new app versions count through POST /:id/view (once per device) and pass
// ?noview=1 here. The admin (Authorization header) and the share page (?noview=1)
// never count. Older app versions already in the stores still count here as before.
router.get('/:id', async (req, res) => {
  try {
    const skipView = req.query.noview === '1' || !!req.headers.authorization;
    const article = skipView
      ? await Article.findById(req.params.id)
      : await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!article) return res.status(404).json({ error: 'الخبر غير موجود' });

    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الخبر' });
  }
});

// POST /api/articles/:id/view — count one view per device (public, called by the app)
router.post('/:id/view', async (req, res) => {
  const device = typeof req.body?.deviceId === 'string' ? req.body.deviceId.trim() : '';
  if (!device || device.length > 64 || !mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'طلب غير صالح' });
  }
  try {
    const result = await ArticleView.updateOne(
      { article: req.params.id, device },
      { $setOnInsert: { article: req.params.id, device } },
      { upsert: true }
    );
    const isNew = result.upsertedCount > 0;
    if (isNew) await Article.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });
    res.json({ counted: isNew });
  } catch (err) {
    if (err.code === 11000) return res.json({ counted: false }); // same device, concurrent request
    res.status(500).json({ error: 'خطأ في تسجيل المشاهدة' });
  }
});

// POST /api/articles — create (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, content, imageUrl, videoUrl, author, category, tags, isPublished, sendNotification } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ error: 'العنوان والوصف والمحتوى مطلوبون' });
    }

    const article = await Article.create({
      title, description, content, imageUrl, videoUrl, author, category,
      tags: tags || [],
      isPublished: isPublished !== false,
    });

    // Send push notification if requested
    if (sendNotification && article.isPublished) {
      try {
        // Only devices that follow this category (or all categories)
        const tokens = await getActiveTokens(article.category);

        if (tokens.length > 0) {
          await sendPushNotifications(tokens, title, description, { articleId: article._id.toString() });
          console.log(`📨 Article notification sent to ${tokens.length} devices`);
        }
      } catch (e) {
        console.error('Error sending article notification:', e);
      }
    }

    res.status(201).json({ article });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في إنشاء الخبر' });
  }
});

// PUT /api/articles/:id — update (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ error: 'الخبر غير موجود' });
    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحديث الخبر' });
  }
});

// DELETE /api/articles/:id — delete (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'الخبر غير موجود' });
    await ArticleView.deleteMany({ article: article._id });
    res.json({ message: 'تم حذف الخبر بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في حذف الخبر' });
  }
});

module.exports = router;
