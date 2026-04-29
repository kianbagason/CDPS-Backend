const axios = require('axios');

async function quickOICFix() {
  try {
    console.log('Quick OIC Fix - Testing Frontend Simulation...');
    
    // Get the current user (assuming you're logged in as Kian fredrick Bagason)
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data.data;
    
    // Find a sample student to simulate membership actions
    const sampleStudent = students.find(s => s.firstName && s.lastName);
    
    if (!sampleStudent) {
      console.log('No students found in database');
      return;
    }
    
    console.log(`Using student: ${sampleStudent.firstName} ${sampleStudent.lastName} (ID: ${sampleStudent._id})`);
    
    // Get current groups
    const groupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const groups = groupsResponse.data.data;
    
    console.log('\nCurrent groups from API:');
    groups.forEach(group => {
      console.log(`${group.name}: members=${(group.members||[]).length}`);
    });
    
    // Simulate the frontend OIC detection
    const isOIC = () => false; // OIC removed
    
    console.log('\n--- Frontend Simulation ---');
    groups.forEach(group => {
      console.log(`${group.name}: ${(group.members||[]).length > 0 ? 'HAS MEMBERS' : 'NO MEMBERS'}`);
    });
    
    // If OIC detection is failing, let's create a workaround
    const sitesGroup = groups.find(g => g.name === 'SITES');
    if (sitesGroup) {
      console.log('\nSITES group members:', JSON.stringify(sitesGroup.members || []));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

quickOICFix();
