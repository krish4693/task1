require('dotenv').config(); // Load .env into process.env
const mongoose = require('mongoose');
const config = require('../config/config'); // Assumes config.mongoose.url reads from process.env
const logger = require('../config/logger'); // Your Winston logger
const User = require('../models/user.model');

async function seedAdmin() {
  try {
    // 1. Connect using the URL from your .env
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('🗄️  Connected to MongoDB for seeding');

    // 2. Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.info(`✅ Admin already exists: ${existingAdmin.email}`);
    } else {
      // 3. Create the default admin
      const adminData = {
        firstName: 'Super',
        lastName: 'Admin',
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        country: process.env.ADMIN_COUNTRY || 'USA',
        password: process.env.ADMIN_PASSWORD || 'Admin1234', // will be hashed
        role: 'admin',
        isEmailVerified: true,
      };
      const admin = await User.create(adminData);
      logger.info(`🚀 Default admin created: ${admin.email}`);
    }
  } catch (err) {
    logger.error('❌ Seeding admin failed:', err);
  } finally {
    // 4. Disconnect and exit
    await mongoose.disconnect();
    logger.info('🛑 Disconnected after seeding');
    process.exit(0);
  }
}

seedAdmin();
