const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Creating new admin user...\n');
      
      // Create admin user
      const newAdmin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      
      await newAdmin.save();
      
      console.log('✅ New admin user created!\n');
    } else {
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Admin password has been reset!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Role: Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
