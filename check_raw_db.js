const mongoose = require('mongoose');
const Group = require('./models/Group');

async function checkRawDB() {
  try {
    // Connect to MongoDB using the same connection as the server
    await mongoose.connect('mongodb://localhost:27017/cdps-profiling', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Get raw SITES group data
    const sitesGroup = await Group.findOne({ name: 'SITES' });
    console.log('Raw SITES group data:');
    console.log(JSON.stringify(sitesGroup, null, 2));
    
    // OIC removed: no OIC fields to check or populate
    console.log('\nOIC fields removed from schema; skipping OIC population and checks.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRawDB();
