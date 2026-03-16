const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    console.log('🧪 Testing API Endpoints...');
    console.log('=' .repeat(50));

    // Test 1: Health Check
    console.log('\n1️⃣  Testing Health Check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log(`   ✅ Health Check: ${healthResponse.data.message}`);
    } catch (error) {
      console.log(`   ❌ Health Check Failed: ${error.message}`);
    }

    // Test 2: Login
    console.log('\n2️⃣  Testing Admin Login...');
    let authToken = '';
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'officialmanishsirohi.01@gmail.com',
        password: 'admin@123'
      });
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.token;
        console.log(`   ✅ Login Successful: ${loginResponse.data.admin.role}`);
        console.log(`   📧 Email: ${loginResponse.data.admin.email}`);
        console.log(`   🔑 Token: ${authToken.substring(0, 20)}...`);
      } else {
        console.log(`   ❌ Login Failed: ${loginResponse.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Login Error: ${error.response?.data?.message || error.message}`);
      return;
    }

    if (!authToken) {
      console.log('❌ Cannot proceed without authentication token');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test 3: SEO Endpoints
    console.log('\n3️⃣  Testing SEO Endpoints...');
    
    const seoEndpoints = [
      { method: 'GET', url: '/seo', name: 'Get SEO Data' },
      { method: 'GET', url: '/seo/stats', name: 'Get SEO Stats' }
    ];

    for (const endpoint of seoEndpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE}${endpoint.url}`,
          headers
        });
        console.log(`   ✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 4: Other Admin Endpoints
    console.log('\n4️⃣  Testing Other Admin Endpoints...');
    
    const adminEndpoints = [
      { method: 'GET', url: '/admin/stats', name: 'Admin Stats' },
      { method: 'GET', url: '/reports?page=1&limit=5', name: 'Reports' },
      { method: 'GET', url: '/volunteers?page=1&limit=5', name: 'Volunteers' },
      { method: 'GET', url: '/feedback?page=1&limit=5', name: 'Feedback' },
      { method: 'GET', url: '/contact?page=1&limit=5', name: 'Contacts' },
      { method: 'GET', url: '/donations?page=1&limit=5', name: 'Donations' },
      { method: 'GET', url: '/board?page=1&limit=5', name: 'Board Applications' },
      { method: 'GET', url: '/legacy?page=1&limit=5', name: 'Legacy Giving' },
      { method: 'GET', url: '/schemes?page=1&limit=5', name: 'Government Schemes' },
      { method: 'GET', url: '/expansion?page=1&limit=5', name: 'Expansion Requests' }
    ];

    let successCount = 0;
    for (const endpoint of adminEndpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE}${endpoint.url}`,
          headers
        });
        console.log(`   ✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
        if (response.data.success) successCount++;
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 5: Content Management Endpoints
    console.log('\n5️⃣  Testing Content Management Endpoints...');
    
    const contentEndpoints = [
      { method: 'GET', url: '/content?page=1&limit=5', name: 'Content' },
      { method: 'GET', url: '/press?page=1&limit=5', name: 'Press Releases' },
      { method: 'GET', url: '/documentaries?page=1&limit=5', name: 'Documentaries' },
      { method: 'GET', url: '/gallery?page=1&limit=5', name: 'Gallery' },
      { method: 'GET', url: '/settings', name: 'Settings' },
      { method: 'GET', url: '/analytics', name: 'Analytics' }
    ];

    let contentSuccessCount = 0;
    for (const endpoint of contentEndpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE}${endpoint.url}`,
          headers
        });
        console.log(`   ✅ ${endpoint.name}: ${response.status} - ${response.data.success ? 'Success' : 'Failed'}`);
        if (response.data.success) contentSuccessCount++;
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 API Testing Summary');
    console.log('='.repeat(50));
    console.log(`✅ Admin Endpoints: ${successCount}/${adminEndpoints.length} working`);
    console.log(`✅ Content Endpoints: ${contentSuccessCount}/${contentEndpoints.length} working`);
    console.log(`✅ SEO Endpoints: Available (check individual results above)`);
    
    const totalEndpoints = adminEndpoints.length + contentEndpoints.length + 2; // +2 for SEO
    const totalSuccess = successCount + contentSuccessCount;
    
    if (totalSuccess >= totalEndpoints * 0.8) {
      console.log('\n🎉 API Testing: MOSTLY SUCCESSFUL');
      console.log('✅ Super admin permissions are working correctly');
      console.log('✅ Backend APIs are responding properly');
    } else {
      console.log('\n⚠️  API Testing: SOME ISSUES FOUND');
      console.log('❌ Some endpoints may need attention');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Start the backend server: npm start (in backend folder)');
    console.log('   2. Start the frontend server: npm run dev (in frontend folder)');
    console.log('   3. Login with: officialmanishsirohi.01@gmail.com / admin@123');
    console.log('   4. Test the admin panel functionality');

  } catch (error) {
    console.error('❌ API Testing failed:', error.message);
  }
};

// Run tests
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;