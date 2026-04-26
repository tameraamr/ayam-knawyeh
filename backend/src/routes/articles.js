const express = require('express');
const Article = require('../models/Article');
const authMiddleware = require('../middleware/auth');
const { sendPushNotifications } = require('../services/expoPush');
const PushToken = require('../models/PushToken');

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
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'الخبر غير موجود' });

    // Increment views
    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الخبر' });
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
        const tokenDocs = await PushToken.find({ active: true });
        const tokens = tokenDocs.map(doc => doc.token);
        
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
    res.json({ message: 'تم حذف الخبر بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في حذف الخبر' });
  }
});

module.exports = router;
