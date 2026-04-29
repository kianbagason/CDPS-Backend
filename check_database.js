const mongoose = require('mongoose');
const Group = require('./models/Group');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cdps-profiling');
    console.log('Connected to MongoDB');
    
    const sitesGroup = await Group.findOne({ name: 'SITES' });
    console.log('Raw SITES group from database:');
    console.log(JSON.stringify(sitesGroup, null, 2));
    
    // OIC removed: no oic fields to report
    console.log('OIC fields removed from schema; skipping OIC checks.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
