require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostx';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB for admin seed...');
    await mongoose.connect(MONGO_URI);

    const adminEmail = 'admin@lostx.campus';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (admin) {
      admin.name = 'Campus Administrator';
      admin.role = 'admin';
      admin.passwordHash = passwordHash;
      await admin.save();
      console.log(`Admin user "${adminEmail}" updated successfully.`);
    } else {
      admin = await User.create({
        name: 'Campus Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin'
      });
      console.log(`Admin user created successfully.`);
    }

    console.log('\n===========================================');
    console.log('Admin Credentials:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Role:     admin');
    console.log('===========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
