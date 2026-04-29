const axios = require('axios');

async function directFix() {
  try {
    console.log('Testing API endpoints...');
    
    // Test groups endpoint
    const groupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = groupsResponse.data.data;
    
    console.log('Groups from API:');
    groups.forEach(group => {
      console.log(`Name: ${group.name}`);
      console.log(`Members: ${JSON.stringify(group.members || [])}`);
      console.log('---');
    });
    
    // Find SITES group
    const sitesGroup = groups.find(g => g.name === 'SITES');
    if (sitesGroup) {
      console.log(`\nSITES group found with ID: ${sitesGroup._id}`);
      
      // Check if we can get the raw group data
      const rawResponse = await axios.get(`http://localhost:5000/api/organizations/groups/${sitesGroup._id}`);
      console.log('Raw SITES group:', JSON.stringify(rawResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

directFix();
