const request = require('supertest');
const app = require('../server');

describe('API Health Check', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Moksha Seva API is running');
  });
});

describe('Report API', () => {
  test('POST /api/reports should create a report', async () => {
    const reportData = {
      reporterPhone: '+919876543210',
      exactLocation: 'Test Location',
      area: 'Test Area',
      city: 'Test City',
      state: 'Test State',
      locationType: 'road',
      dateFound: '2024-01-01',
      timeFound: '10:00',
      gender: 'male',
      bodyCondition: 'recent',
      agreeToTerms: true,
      consentToShare: true
    };

    const response = await request(app)
      .post('/api/reports')
      .send(reportData);
    
    // Debug: Log the response if it's not 201
    if (response.status !== 201) {
      console.log('Report API Error:', response.status, response.body);
    }
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.caseNumber).toBeDefined();
  });
});

describe('Feedback API', () => {
  test('POST /api/feedback should create feedback', async () => {
    const feedbackData = {
      name: 'Test User',
      email: 'test@example.com',
      feedbackType: 'service_experience',
      experienceRating: 5,
      subject: 'Test Subject',
      message: 'This is a test feedback message',
      wouldRecommend: 'yes'
    };

    const response = await request(app)
      .post('/api/feedback')
      .send(feedbackData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.referenceNumber).toBeDefined();
  });
});

describe('Contact API', () => {
  test('POST /api/contact should create contact inquiry', async () => {
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      subject: 'Test Subject',
      message: 'This is a test contact message'
    };

    const response = await request(app)
      .post('/api/contact')
      .send(contactData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.ticketNumber).toBeDefined();
  });
});

describe('Volunteer API', () => {
  test('POST /api/volunteers should create volunteer application', async () => {
    const volunteerData = {
      name: 'Test Volunteer',
      email: 'volunteer@example.com',
      phone: '+919876543210',
      registrationType: 'individual',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: 'Test Address Line 1, Test Address Line 2',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      occupation: 'Software Engineer',
      availability: 'weekends',
      agreeToTerms: true,
      agreeToBackgroundCheck: true
    };

    const response = await request(app)
      .post('/api/volunteers')
      .send(volunteerData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.volunteerId).toBeDefined();
  });
});

describe('Donation API', () => {
  test('POST /api/donations should create donation', async () => {
    const donationData = {
      name: 'Test Donor',
      email: 'donor@example.com',
      phone: '+919876543210',
      amount: 1000,
      paymentMethod: 'upi',
      donationType: 'one_time',
      purpose: 'general'
    };

    const response = await request(app)
      .post('/api/donations')
      .send(donationData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.donationId).toBeDefined();
  });
});

describe('Board Application API', () => {
  test('POST /api/board should create board application', async () => {
    const boardData = {
      name: 'Test Board Member',
      email: 'board@example.com',
      phone: '+919876543210',
      dateOfBirth: '1990-01-01',
      address: 'Test Address Line 1, Test Address Line 2',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      currentPosition: 'Manager',
      organization: 'Test Organization',
      experience: 5,
      qualifications: 'MBA in Management, 5 years experience in non-profit sector',
      positionInterested: 'board_member',
      motivationStatement: 'I want to contribute to the noble cause of providing dignified farewells to unclaimed bodies and help expand the reach of Moksha Seva.',
      timeCommitment: '10_hours_month',
      expertise: ['operations', 'fundraising']
    };

    const response = await request(app)
      .post('/api/board')
      .send(boardData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.applicationId).toBeDefined();
  });
});

describe('Legacy Giving API', () => {
  test('POST /api/legacy should create legacy giving request', async () => {
    const legacyData = {
      name: 'Test Legacy Donor',
      email: 'legacy@example.com',
      phone: '+919876543210',
      legacyType: 'will_bequest',
      timeframe: '3_5_years',
      estimatedValue: '500000',
      specificPurpose: 'General support for cremation services'
    };

    const response = await request(app)
      .post('/api/legacy')
      .send(legacyData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.requestId).toBeDefined();
  });
});

describe('Government Scheme API', () => {
  test('POST /api/schemes should create scheme application', async () => {
    const schemeData = {
      name: 'Test Applicant',
      email: 'scheme@example.com',
      phone: '+919876543210',
      schemeName: 'Test Government Scheme',
      schemeType: 'central',
      incomeCategory: 'bpl',
      familySize: 4,
      address: 'Test Address Line 1, Test Address Line 2',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      agreeToTerms: true
    };

    const response = await request(app)
      .post('/api/schemes')
      .send(schemeData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.applicationId).toBeDefined();
  });
});

describe('Expansion Request API', () => {
  test('POST /api/expansion should create expansion request', async () => {
    const expansionData = {
      name: 'Test Requester',
      email: 'expansion@example.com',
      phone: '+919876543210',
      requestedCity: 'New Test City',
      requestedState: 'New Test State',
      population: 500000,
      localSupport: 'organization',
      organization: 'Local NGO',
      whyNeeded: 'There is a significant need for dignified funeral services in this area as there are many unclaimed bodies and limited resources for proper cremation services.',
      expectedImpact: 'Will help serve 100+ unclaimed bodies annually'
    };

    const response = await request(app)
      .post('/api/expansion')
      .send(expansionData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.requestId).toBeDefined();
  });
});

describe('Admin API', () => {
  test('GET /api/admin/dashboard should return dashboard stats', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.overview).toBeDefined();
    expect(response.body.data.recentActivity).toBeDefined();
  });

  test('GET /api/admin/system-health should return system health', async () => {
    const response = await request(app)
      .get('/api/admin/system-health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe('connected');
    expect(response.body.data.server).toBe('running');
  });
});