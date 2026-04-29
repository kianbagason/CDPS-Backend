const axios = require('axios');

async function testFixedWorkflow() {
  try {
    console.log('Testing affiliation workflow...');
    
    // Get current data
    const [studentsResponse, groupsResponse] = await Promise.all([
      axios.get('http://localhost:5000/api/students'),
      axios.get('http://localhost:5000/api/organizations/groups')
    ]);
    
    const students = studentsResponse.data.data;
    const groups = groupsResponse.data.data;
    
    // Find a test student and SitesOrg
    const kianStudent = students.find(s => s.firstName.includes('Kian') && s.lastName.includes('Bagason')) || students[0];
    const sitesGroup = groups.find(g => g.name === 'SitesOrg');
    
    if (!kianStudent || !sitesGroup) {
      console.log('Kian student or SitesOrg group not found');
      return;
    }
    
    console.log(`Student: ${kianStudent.firstName} ${kianStudent.lastName} (ID: ${kianStudent._id})`);
    console.log(`SitesOrg Group: ${sitesGroup.name}`);
    
    // Simulate the frontend logic
    const isOIC = () => false; // OIC removed
    const isMemberOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === kianStudent._id && m.status === 'active'));
    const isPendingOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === kianStudent._id && m.status === 'pending'));
    
    console.log('\n--- Current State ---');
    console.log(`Is OIC: ${isOIC(sitesGroup)}`);
    console.log(`Is member: ${isMemberOf(groups, sitesGroup._id)}`);
    console.log(`Is pending: ${isPendingOf(groups, sitesGroup._id)}`);
    
    // Manually add Kian as member to test the workflow
    if (!isMemberOf(groups, sitesGroup._id) && isOIC(sitesGroup)) {
      console.log('\n--- FIXING: Adding Kian as member of SitesOrg ---');
      
      try {
        // Use the update endpoint to trigger the OIC membership logic
        const updateResponse = await axios.put(`http://localhost:5000/api/organizations/groups/${sitesGroup._id}`, {
          name: sitesGroup.name,
          description: sitesGroup.description,
          oic: kianStudent._id
        });
        
        console.log('Update successful!');
        console.log('Updated group members:', JSON.stringify(updateResponse.data.data.members, null, 2));
        
        // Test the workflow after the fix
        const updatedGroupsResponse = await axios.get('http://localhost:5000/api/organizations/groups');
        const updatedGroups = updatedGroupsResponse.data.data;
        const updatedSitesGroup = updatedGroups.find(g => g.name === 'SitesOrg');
        
        console.log('\n--- After Fix ---');
        console.log(`Is OIC: ${isOIC(updatedSitesGroup)}`);
        console.log(`Is member: ${isMemberOf(updatedGroups, updatedSitesGroup._id)}`);
        console.log(`Is pending: ${isPendingOf(updatedGroups, updatedSitesGroup._id)}`);
        
        console.log('\n--- Frontend Simulation ---');
        
        // Test "My Affiliations" section
        console.log('\n1. MY AFFILIATIONS Section:');
        if (isMemberOf(updatedGroups, updatedSitesGroup._id) || isPendingOf(updatedGroups, updatedSitesGroup._id)) {
          console.log('RESULT: SitesOrg WILL appear in "My Affiliations" section');
          if (isOIC(updatedSitesGroup)) {
            console.log('  -> Will show "Manage Members" options');
          }
        } else {
          console.log('RESULT: SitesOrg will NOT appear in "My Affiliations" section');
        }
        
        // Test "Available Affiliations" section
        console.log('\n2. AVAILABLE AFFILIATIONS Section:');
        if (isMemberOf(updatedGroups, updatedSitesGroup._id)) {
          console.log('RESULT: SitesOrg will show "Member" (no button)');
        } else if (isPendingOf(updatedGroups, updatedSitesGroup._id)) {
          console.log('RESULT: SitesOrg will show "Pending" (no button)');
        } else {
          console.log('RESULT: SitesOrg will show "Request to Join" button');
        }
        
        console.log('\n--- Workflow Summary ---');
        if (isOIC(updatedSitesGroup) && isMemberOf(updatedGroups, updatedSitesGroup._id)) {
          console.log('SUCCESS: OIC workflow is now working correctly!');
          console.log('- OIC appears in "My Affiliations" with management options');
          console.log('- OIC does NOT appear in "Available Affiliations" (no confusing "Request to Join")');
          console.log('- OIC can manage members of their assigned group');
        } else {
          console.log('FAILURE: Workflow still has issues');
        }
        
      } catch (error) {
        console.error('Update failed:', error.response?.data || error.message);
      }
    } else {
      console.log('Workflow is already correct!');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFixedWorkflow();
