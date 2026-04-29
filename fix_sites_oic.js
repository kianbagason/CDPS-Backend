const axios = require('axios');

async function fixSitesOIC() {
  try {
    // Get available students
    const studentsResponse = await axios.get('http://localhost:5000/api/students');
    const students = studentsResponse.data.data;
    
    console.log('Available students:');
    students.slice(0, 3).forEach(student => {
      console.log(`${student.firstName} ${student.lastName} (ID: ${student._id})`);
    });
    
    // Get the SITES group
    const groupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
    const sitesGroup = groupsResponse.data.data.find(g => g.name === 'SITES');
    
    if (!sitesGroup) {
      console.log('SITES group not found');
      return;
    }
    
    console.log(`\nSITES group members: ${JSON.stringify(sitesGroup.members || [])}`);
    
    // Update SITES group with first available student as OIC
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`\nAdding first student as member to SITES: ${firstStudent.firstName} ${firstStudent.lastName}`);
      
      const updateResponse = await axios.put(`http://localhost:5000/api/organizations/groups/${sitesGroup._id}`, {
        name: sitesGroup.name,
        description: sitesGroup.description,
        members: [
          {
            studentId: firstStudent._id,
            status: 'active',
            joinedAt: new Date()
          }
        ]
      });
      
      console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));
      
      // Verify the update
      const verifyResponse = await axios.get('http://localhost:5000/api/organizations/groups');
      const updatedSitesGroup = verifyResponse.data.data.find(g => g.name === 'SITES');
      
      console.log('\nUpdated SITES group members:', JSON.stringify(updatedSitesGroup.members || []));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

fixSitesOIC();
