const mongoose = require('mongoose');

// A reader's report about an article or an ad ("إبلاغ" button in the app).
const reportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['article', 'ad'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetTitle: { type: String, default: '' }, // snapshot, still readable if the item is deleted
  reason: { type: String, trim: true, maxlength: 500, default: '' },
  device: { type: String, required: true, maxlength: 64 }, // anonymous app id, one report per device per item
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

reportSchema.index({ targetType: 1, targetId: 1, device: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
