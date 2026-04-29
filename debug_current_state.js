const axios = require('axios');

async function debugCurrentState() {
  try {
    console.log('Debugging current state...');
    
    // Get all groups
    const groupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = groupsResponse.data.data;
    
    console.log('All groups:');
    groups.forEach(group => {
      console.log(`${group.name}: members=${(group.members||[]).length}`);
    });
    
    // Get all students
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data.data;
    
    console.log('\nAll students:');
    students.slice(0, 3).forEach(student => {
      console.log(`${student.firstName} ${student.lastName} (ID: ${student._id})`);
    });
    
    // Find the SITES group
    const sitesGroup = groups.find(g => g.name === 'SITES');
    if (sitesGroup) {
      console.log(`\nSITES group found:`);
      console.log(`Name: ${sitesGroup.name}`);
      console.log(`Members: ${JSON.stringify(sitesGroup.members || [])}`);
      console.log(`Group ID: ${sitesGroup._id}`);
      
      // OIC removed: no automatic OIC fixes. If no members exist, report.
      if ((sitesGroup.members||[]).length === 0) {
        console.log('\nSITES group has no members.');
      }
    } else {
      console.log('SITES group not found!');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugCurrentState();
