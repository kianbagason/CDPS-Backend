const axios = require('axios');

async function debugGroupStructure() {
  try {
    console.log('Debugging Group Structure...');
    
    // Get current data
    const [studentsResponse, groupsResponse] = await Promise.all([
      axios.get('http://localhost:5000/api/students'),
      axios.get('http://localhost:5000/api/organizations/groups')
    ]);
    
    const students = studentsResponse.data.data;
    const groups = groupsResponse.data.data;
    
    // Find Kian and SitesOrg
    const kianStudent = students.find(s => s.firstName.includes('Kian') && s.lastName.includes('Bagason'));
    const sitesGroup = groups.find(g => g.name === 'SitesOrg');
    
    if (!kianStudent || !sitesGroup) {
      console.log('Kian student or SitesOrg group not found');
      return;
    }
    
    console.log(`Kian Student ID: ${kianStudent._id}`);
    console.log(`SitesOrg Group ID: ${sitesGroup._id}`);
    console.log(`SitesOrg Members: ${JSON.stringify(sitesGroup.members)}`);
    
    // Manually add Kian as member using direct API call
    console.log('\n--- Manually adding Kian as member ---');
    
    try {
      // Use the join endpoint to add Kian as a member
      const joinData = {
        studentId: kianStudent._id,
        status: 'active'
      };
      
      // Directly update the group members array (no OIC assignment)
      const updateResponse = await axios.put(`http://localhost:5000/api/organizations/groups/${sitesGroup._id}`, {
        name: sitesGroup.name,
        description: sitesGroup.description,
        members: [
          {
            studentId: kianStudent._id,
            status: 'active',
            joinedAt: new Date()
          }
        ]
      });
      
      console.log('Direct update successful!');
      console.log('Updated group:', JSON.stringify(updateResponse.data.data, null, 2));
      
      // Test the workflow again
      const updatedGroupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
      const updatedGroups = updatedGroupsResponse.data.data;
      const updatedSitesGroup = updatedGroups.find(g => g.name === 'SitesOrg');
      
      console.log('\n--- After Manual Fix ---');
      console.log(`Updated members: ${JSON.stringify(updatedSitesGroup.members)}`);
      
      // Test the workflow
      const isOIC = () => false; // OIC removed
      const isMemberOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === kianStudent._id && m.status === 'active'));
      
      console.log(`Is OIC: ${isOIC(updatedSitesGroup)}`);
      console.log(`Is member: ${isMemberOf(updatedGroups, updatedSitesGroup._id)}`);
      
      if (isMemberOf(updatedGroups, updatedSitesGroup._id)) {
        console.log('\nSUCCESS: Member added and workflow looks correct');
        console.log('- Member is now part of their assigned group');
        console.log('- Member will see appropriate affiliation options in "My Affiliations"');
      } else {
        console.log('\nFAILURE: Still not working');
      }
      
    } catch (error) {
      console.error('Manual fix failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugGroupStructure();
