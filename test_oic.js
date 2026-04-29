const axios = require('axios');

async function testOIC() {
  try {
    const response = await axios.post('http://localhost:5000/api/organizations', {
      name: 'Test Org',
      description: 'Test Description'
    });
    
    console.log('Organization created successfully:', response.data);
    
    // Test the get endpoint
    const getResponse = await axios.get('http://localhost:5000/api/organizations');
    console.log('Organizations:', JSON.stringify(getResponse.data.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testOIC();
