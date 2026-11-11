const mongoose = require('mongoose');

const CATEGORIES = ['اخبار البلد', 'مواليد جدد', 'ابناء كفركنا', 'افراح', 'يصادف اليوم', 'محلات تجارية', 'تنويهات'];

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Rich HTML content
  imageUrl: { type: String, default: null },
  videoUrl: { type: String, default: null }, // Optional video URL
  author: { type: String, default: 'المحرر' },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'اخبار البلد'
  },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, {
  timestamps: true,
});

// Text index for search
articleSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Article', articleSchema);
module.exports.CATEGORIES = CATEGORIES;
