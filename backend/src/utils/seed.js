const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    if (!existing) {
      const passwordHash = await Admin.hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash,
        role: 'superadmin',
      });
      console.log(`👤 Admin user created: ${process.env.ADMIN_USERNAME || 'admin'}`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = { seedAdmin };
