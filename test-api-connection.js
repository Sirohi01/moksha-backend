// Simple test script to verify API connection
const testAPIConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend health check:', healthData.message);
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test board endpoint with sample data
    const testBoardData = {
      name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      positionInterested: "legal_advisor",
      whyJoin: "Test reason",
      contribution: "Test contribution",
      agreeToTerms: true,
      agreeToBackgroundCheck: true
    };

    console.log('🔍 Testing board API endpoint...');
    const boardResponse = await fetch('http://localhost:5000/api/board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBoardData)
    });

    if (boardResponse.ok) {
      const boardResult = await boardResponse.json();
      console.log('✅ Board API test successful:', boardResult.message);
    } else {
      const error = await boardResponse.json();
      console.log('❌ Board API test failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
    console.log('💡 Run: cd backend && npm run dev');
  }
};

// Run the test
testAPIConnection();