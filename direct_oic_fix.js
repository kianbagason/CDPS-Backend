const mongoose = require('mongoose');
const Group = require('./models/Group');

async function directOICFix() {
  try {
    // Connect to MongoDB using the same connection as the server
    await mongoose.connect('mongodb://localhost:27017/cdps-profiling', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find the SitesOrg group
    const sitesGroup = await Group.findOne({ name: 'SitesOrg' });
    console.log('Found SitesOrg group:', sitesGroup.name);
    console.log('Current members:', sitesGroup.members);
    
    // Get Kian's student ID
    const kianStudentId = '69d4aa8bef1bbac677eddb9f';
    
    // Check if Kian is already a member
    const isAlreadyMember = sitesGroup.members.some(member => 
      member.studentId.toString() === kianStudentId
    );
    
    if (!isAlreadyMember) {
      console.log('Adding Kian as member...');
      
      // Add Kian as a member (no OIC role)
      sitesGroup.members.push({
        studentId: kianStudentId,
        status: 'active',
        joinedAt: new Date()
      });
      
      await sitesGroup.save();
      console.log('Kian added as member successfully!');
      
      // Verify the update
      const updatedGroup = await Group.findOne({ name: 'SitesOrg' });
      console.log('Updated members:', updatedGroup.members);
      
      console.log('\nSUCCESS: Member added to SitesOrg');
      console.log('- Kian is now a member of SitesOrg');
      
    } else {
      console.log('Kian is already a member');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

directOICFix();
