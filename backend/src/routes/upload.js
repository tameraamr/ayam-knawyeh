const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Ensure directories exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const videosDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
[uploadsDir, videosDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ─── Image storage ─────────────────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('يُسمح فقط بملفات الصور (JPEG, PNG, WebP, GIF)'), false);
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
});

// ─── Video storage ─────────────────────────────────────────────────────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videosDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('يُسمح فقط بملفات الفيديو (MP4, WebM, OGG, MOV, AVI)'), false);
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB) || 200) * 1024 * 1024 }, // 200MB default
});

const getBaseUrl = (req) =>
  process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

// POST /api/upload — single image upload (admin)
router.post('/', authMiddleware, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم اختيار ملف' });
  const imageUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
  res.json({ imageUrl, filename: req.file.filename, type: 'image' });
});

// POST /api/upload/video — single video upload (admin)
router.post('/video', authMiddleware, uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم اختيار ملف فيديو' });
  const videoUrl = `${getBaseUrl(req)}/uploads/videos/${req.file.filename}`;
  res.json({ videoUrl, filename: req.file.filename, type: 'video' });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `خطأ في رفع الملف: ${err.message}` });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
