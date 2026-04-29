const axios = require('axios');

async function testStudentOICWorkflow() {
  try {
    console.log('Testing Student OIC Workflow...');
    
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
      console.log('Kian student or SITES group not found');
      return;
    }
    
    console.log(`Student: ${kianStudent.firstName} ${kianStudent.lastName} (ID: ${kianStudent._id})`);
    console.log(`SITES Group: ${sitesGroup.name}`);
    
    // Simulate the frontend logic
    const isOIC = () => false; // OIC removed
    const isMemberOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === kianStudent._id && m.status === 'active'));
    const isPendingOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === kianStudent._id && m.status === 'pending'));
    
    console.log('\n--- Frontend Simulation ---');
    
    // Test "My Affiliations" section
    console.log('\n1. MY AFFILIATIONS Section:');
    console.log(`SITES - Is member: ${isMemberOf(groups, sitesGroup._id)}`);
    console.log(`SITES - Is pending: ${isPendingOf(groups, sitesGroup._id)}`);
    console.log(`SITES - Is OIC: ${isOIC(sitesGroup)}`);
    
    if (isMemberOf(groups, sitesGroup._id) || isPendingOf(groups, sitesGroup._id)) {
      console.log('RESULT: SITES will appear in "My Affiliations" section');
      if (isOIC(sitesGroup)) {
        console.log('  -> Will show "Manage Members" options');
      }
    } else {
      console.log('RESULT: SITES will NOT appear in "My Affiliations" section');
    }
    
    // Test "Available Affiliations" section
    console.log('\n2. AVAILABLE AFFILIATIONS Section:');
    groups.forEach(group => {
      console.log(`${group.name}:`);
      console.log(`  - Is member: ${isMemberOf(groups, group._id)}`);
      console.log(`  - Is pending: ${isPendingOf(groups, group._id)}`);
      console.log(`  - Is OIC: ${isOIC(group)}`);
      
      if (isMemberOf(groups, group._id)) {
        console.log(`  -> Will show "Member" (no button)`);
      } else if (isPendingOf(groups, group._id)) {
        console.log(`  -> Will show "Pending" (no button)`);
      } else {
        console.log(`  -> Will show "Request to Join" button`);
      }
    });
    
    // Check if there's an issue with the workflow
    console.log('\n--- Workflow Analysis ---');
    // Since OIC is removed, focus on membership status only
    if (!isMemberOf(groups, sitesGroup._id) && isPendingOf(groups, sitesGroup._id)) {
      console.log('SITES is pending for the student.');
    } else if (isMemberOf(groups, sitesGroup._id)) {
      console.log('Student is a member of SITES.');
    } else {
      console.log('Student is not affiliated with SITES.');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStudentOICWorkflow();
