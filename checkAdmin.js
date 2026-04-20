const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    console.log('🔍 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Total users in database: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ NO USERS FOUND in the database!');
      console.log('You need to create an admin user first.\n');
      console.log('Run this command:');
      console.log('  node scripts/createDefaultAdmin.js\n');
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  USERS IN DATABASE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Password Hash: ${user.password.substring(0, 30)}...`);
        console.log('');
      });

      // Check for admin specifically
      const adminUser = await User.findOne({ username: 'admin' });
      
      if (adminUser) {
        console.log('✅ Admin user EXISTS in database');
        console.log('   Username: admin');
        console.log('   Role:', adminUser.role);
        console.log('\n🔐 Try logging in with:');
        console.log('   Username: admin');
        console.log('   Password: admin123 (or whatever you set)\n');
        
        console.log('⚠️  If login still fails, possible reasons:');
        console.log('   1. Wrong password');
        console.log('   2. Backend not connected to this database');
        console.log('   3. CORS issues blocking the request\n');
        
        console.log('💡 To reset admin password, run:');
        console.log('   node scripts/resetAdminPassword.js\n');
      } else {
        console.log('❌ No admin user found with username "admin"\n');
        console.log('💡 To create admin user, run:');
        console.log('   node scripts/createDefaultAdmin.js\n');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure your MONGODB_URI in .env file is correct.');
    process.exit(1);
  }
};

checkAdmin();
