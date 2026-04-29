const axios = require('axios');

async function fixSitesFinal() {
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
    
    console.log(`\nCurrent SITES group:`);
    console.log(`Name: ${sitesGroup.name}`);
    console.log(`Members: ${JSON.stringify(sitesGroup.members || [])}`);
    console.log(`Group ID: ${sitesGroup._id}`);
    
    // Update SITES group with a student as OIC using the update endpoint
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`\nAdding first student as member to SITES: ${firstStudent.firstName} ${firstStudent.lastName}`);
      try {
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
        
        console.log('Update successful!');
        console.log('Updated group data:', JSON.stringify(updateResponse.data.data, null, 2));
      } catch (updateError) {
        console.error('Update failed:', updateError.response?.data || updateError.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

fixSitesFinal();
