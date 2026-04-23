const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'editor'], default: 'editor' },
}, {
  timestamps: true,
});

adminSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('Admin', adminSchema);
