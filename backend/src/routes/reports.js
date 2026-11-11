const express = require('express');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Article = require('../models/Article');
const Ad = require('../models/Ad');
const authMiddleware = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimits');

const router = express.Router();

// POST /api/reports — a reader reports an article or an ad (public, from the app)
router.post('/', reportLimiter, async (req, res) => {
  const { targetType, targetId, reason, deviceId } = req.body || {};
  if (!['article', 'ad'].includes(targetType) || !mongoose.isValidObjectId(targetId)
      || typeof deviceId !== 'string' || !deviceId.trim() || deviceId.length > 64) {
    return res.status(400).json({ error: 'طلب غير صالح' });
  }

  try {
    const Model = targetType === 'article' ? Article : Ad;
    const target = await Model.findById(targetId).select('title');
    if (!target) return res.status(404).json({ error: 'المحتوى غير موجود' });

    // One report per device per item; reporting again just reopens it.
    await Report.updateOne(
      { targetType, targetId, device: deviceId.trim() },
      {
        $set: { status: 'open', reason: typeof reason === 'string' ? reason.slice(0, 500) : '', targetTitle: target.title || '' },
      },
      { upsert: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'خطأ في إرسال البلاغ' });
  }
});

// GET /api/reports?status=open — list for the admin, grouped by reported item
router.get('/', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status === 'resolved' ? 'resolved' : 'open';
    const groups = await Report.aggregate([
      { $match: { status } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { targetType: '$targetType', targetId: '$targetId' },
          targetTitle: { $first: '$targetTitle' },
          count: { $sum: 1 },
          reasons: { $push: '$reason' },
          lastAt: { $first: '$createdAt' },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 200 },
    ]);
    res.json({
      reports: groups.map((g) => ({
        targetType: g._id.targetType,
        targetId: g._id.targetId,
        targetTitle: g.targetTitle,
        count: g.count,
        reasons: g.reasons.filter(Boolean).slice(0, 5),
        lastAt: g.lastAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب البلاغات' });
  }
});

// POST /api/reports/resolve — admin marks all reports of one item as handled
router.post('/resolve', authMiddleware, async (req, res) => {
  const { targetType, targetId } = req.body || {};
  if (!['article', 'ad'].includes(targetType) || !mongoose.isValidObjectId(targetId)) {
    return res.status(400).json({ error: 'طلب غير صالح' });
  }
  try {
    const r = await Report.updateMany({ targetType, targetId, status: 'open' }, { $set: { status: 'resolved' } });
    res.json({ success: true, resolved: r.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحديث البلاغات' });
  }
});

module.exports = router;
