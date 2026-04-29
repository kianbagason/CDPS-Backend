const axios = require('axios');

async function debugOIC() {
  try {
    const response = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = response.data.data;
    
    console.log('All groups:');
    groups.forEach(group => {
      console.log(`Name: ${group.name}`);
      console.log(`Members: ${JSON.stringify(group.members || [])}`);
      console.log('---');
    });
    
    // Find SITES group
    const sitesGroup = groups.find(g => g.name.toLowerCase().includes('sites'));
    if (sitesGroup) {
      console.log('\nSITES Group Found:');
      console.log(`Name: ${sitesGroup.name}`);
      console.log(`Members: ${JSON.stringify(sitesGroup.members || [])}`);
    } else {
      console.log('\nSITES Group not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugOIC();
