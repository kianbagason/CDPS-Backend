const axios = require('axios');

async function recreateSitesGroup() {
  try {
    console.log('Recreating SITES group...');
    
    // Get available students
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data.data;
    
    console.log('Available students:');
    students.slice(0, 3).forEach(student => {
      console.log(`${student.firstName} ${student.lastName} (ID: ${student._id})`);
    });
    
    // Create the SITES group (no OIC assignment)
    const createResponse = await axios.post('http://localhost:5000/api/organizations/groups', {
      name: 'SITES',
      description: 'SITES ORGANIZATION'
    });
    
    console.log('SITES group created successfully!');
    console.log('Created group:', JSON.stringify(createResponse.data.data, null, 2));
    
    // Verify the creation
    const verifyResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = verifyResponse.data.data;
    const sitesGroup = groups.find(g => g.name === 'SITES');
    
    if (sitesGroup) {
      console.log('\nSITES group verification:');
      console.log(`Name: ${sitesGroup.name}`);
      console.log(`Members: ${JSON.stringify(sitesGroup.members || [])}`);
      console.log('\nNo OIC assignments used in group creation.');
    } else {
      console.log('SITES group not found after creation');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

recreateSitesGroup();
