const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Cloudinary automatically picks up the CLOUDINARY_URL environment variable.

// ─── Image storage ─────────────────────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ayam_knawyeh_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
});

// ─── Video storage ─────────────────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ayam_knawyeh_videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'ogg', 'mov', 'avi']
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB) || 200) * 1024 * 1024 },
});

// POST /api/upload — single image upload (admin)
router.post('/', authMiddleware, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم اختيار ملف' });
  res.json({ imageUrl: req.file.path, filename: req.file.filename, type: 'image' });
});

// POST /api/upload/video — single video upload (admin)
router.post('/video', authMiddleware, uploadVideo.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم اختيار ملف فيديو' });
  res.json({ videoUrl: req.file.path, filename: req.file.filename, type: 'video' });
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
