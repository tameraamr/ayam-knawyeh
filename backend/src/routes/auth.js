const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/auth/me
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
