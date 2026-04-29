const axios = require('axios');

async function testOICDetection() {
  try {
    console.log('Testing affiliation detection logic...');
    
    // Get groups data (what frontend sees)
    const groupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = groupsResponse.data.data;
    
    // OIC removed: simulate basic membership checks
    const mockUser = {
      _id: '69d4aa8bef1bbac677eddb9f',
      firstName: 'Kian fredrick',
      lastName: 'Bagason'
    };
    console.log(`Mock user: ${mockUser.firstName} ${mockUser.lastName} (ID: ${mockUser._id})`);

    const isMember = (item) => (item.members || []).some(m => String(m.studentId?._id || m.studentId) === String(mockUser._id) && m.status === 'active');
    
    console.log('\n--- Testing Affiliation Detection ---');
    groups.forEach(group => {
      const member = isMember(group);
      console.log(`Group: ${group.name} - IsMember: ${member}`);
    });
    
    // Find SITES group specifically
    const sitesGroup = groups.find(g => g.name === 'SITES');
    if (sitesGroup) {
      console.log('\n--- SITES Group Analysis ---');
      console.log(`Name: ${sitesGroup.name}`);
      console.log(`Members: ${JSON.stringify(sitesGroup.members || [])}`);
      console.log(`User is member: ${isMember(sitesGroup)}`);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testOICDetection();
