const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    default: 'android',
  },
  active: {
    type: Boolean,
    default: true,
  },
  // Categories this device wants notifications for. Empty = all categories
  // (also what older app versions get, since they never send this field).
  categories: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('PushToken', pushTokenSchema);
