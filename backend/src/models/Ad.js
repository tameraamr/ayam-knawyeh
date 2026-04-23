const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  content: { type: String, default: '' }, // Rich HTML content (like article body)
  imageUrl: { type: String, default: null },
  videoUrl: { type: String, default: null }, // Optional video URL
  linkUrl: { type: String, default: null },
  isPinned: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ad', adSchema);
