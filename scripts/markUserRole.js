const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
  const [,, username, role] = process.argv;
  if (!username || !role) {
    console.error('Usage: node scripts/markUserRole.js <username> <role>');
    process.exit(1);
  }

  if (!['admin','faculty','student'].includes(role)) {
    console.error('Role must be one of: admin, faculty, student');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('../models/User');
    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found:', username);
      await mongoose.connection.close();
      process.exit(1);
    }

    user.role = role;
    await user.save();
    console.log(`Updated user '${username}' role -> '${role}'`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error updating user role:', err);
    process.exit(1);
  }
};

run();
