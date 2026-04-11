const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const manualPaths = {
  "/api/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Admin Login",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email","password"], properties: { email: { type: "string", example: "admin@mokshasewa.org" }, password: { type: "string", example: "password123" } } } } } },
      responses: { "200": { description: "Login successful, returns JWT token" }, "401": { description: "Invalid credentials" }, "423": { description: "Account locked" } }
    }
  },
  "/api/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Admin Logout",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Logged out successfully" } }
    }
  },
  "/api/auth/refresh-token": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh Access Token",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } } },
      responses: { "200": { description: "New access token returned" } }
    }
  },
  "/api/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Forgot Password - Send reset email",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } } },
      responses: { "200": { description: "Reset email sent" } }
    }
  },
  "/api/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get current logged in admin",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Admin profile data" } }
    }
  },
  "/api/reports": {
    get: {
      tags: ["Reports"],
      summary: "Get all unclaimed body reports",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["pending","in_progress","resolved","closed"] } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }],
      responses: { "200": { description: "List of reports" } }
    },
    post: {
      tags: ["Reports"],
      summary: "Submit a new unclaimed body report",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["reporterPhone","exactLocation","area","city","state","locationType","dateFound","timeFound","gender","bodyCondition","agreeToTerms","consentToShare"], properties: { reporterName: { type: "string" }, reporterPhone: { type: "string", example: "9876543210" }, exactLocation: { type: "string" }, city: { type: "string" }, state: { type: "string" }, gender: { type: "string", enum: ["male","female","other","unknown"] }, bodyCondition: { type: "string", enum: ["recent","decomposed","advanced","skeletal","unknown"] }, policeInformed: { type: "boolean" }, agreeToTerms: { type: "boolean" }, consentToShare: { type: "boolean" } } } } } },
      responses: { "201": { description: "Report submitted, case number generated" } }
    }
  },
  "/api/reports/{id}": {
    get: {
      tags: ["Reports"],
      summary: "Get single report by ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Report details" }, "404": { description: "Report not found" } }
    },
    put: {
      tags: ["Reports"],
      summary: "Update report status or details",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["pending","in_progress","resolved","closed"] }, priority: { type: "string" }, notes: { type: "string" } } } } } },
      responses: { "200": { description: "Report updated" } }
    }
  },
  "/api/volunteers": {
    get: {
      tags: ["Volunteers"],
      summary: "Get all volunteer registrations",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["pending","approved","rejected","active","inactive"] } }],
      responses: { "200": { description: "List of volunteers" } }
    },
    post: {
      tags: ["Volunteers"],
      summary: "Register as a volunteer",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["registrationType","name","email","phone","dateOfBirth","gender","address","city","state","pincode","occupation","availability","agreeToTerms","agreeToBackgroundCheck"], properties: { registrationType: { type: "string", enum: ["individual","group"] }, name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, city: { type: "string" }, state: { type: "string" }, availability: { type: "string" }, volunteerTypes: { type: "array", items: { type: "string" } } } } } } },
      responses: { "201": { description: "Volunteer registered, ID generated" } }
    }
  },
  "/api/volunteers/{id}": {
    get: {
      tags: ["Volunteers"],
      summary: "Get volunteer by ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Volunteer details" } }
    },
    put: {
      tags: ["Volunteers"],
      summary: "Update volunteer status",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["pending","approved","rejected","active","inactive"] } } } } } },
      responses: { "200": { description: "Volunteer updated" } }
    }
  },
  "/api/donations": {
    get: {
      tags: ["Donations"],
      summary: "Get all donations",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "paymentStatus", in: "query", schema: { type: "string", enum: ["pending","completed","failed","refunded"] } }],
      responses: { "200": { description: "List of donations" } }
    },
    post: {
      tags: ["Donations"],
      summary: "Submit a donation",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","amount","paymentMethod"], properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, amount: { type: "number", example: 500 }, donationType: { type: "string", enum: ["one_time","monthly","yearly"] }, purpose: { type: "string" }, paymentMethod: { type: "string", enum: ["card","netbanking","upi","wallet"] }, isAnonymous: { type: "boolean" } } } } } },
      responses: { "201": { description: "Donation recorded, ID generated" } }
    }
  },
  "/api/payments/create-order": {
    post: {
      tags: ["Payments"],
      summary: "Create Razorpay order",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "number", example: 500 }, currency: { type: "string", example: "INR" } } } } } },
      responses: { "200": { description: "Razorpay order created with order ID" } }
    }
  },
  "/api/payments/verify": {
    post: {
      tags: ["Payments"],
      summary: "Verify Razorpay payment signature",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { razorpay_order_id: { type: "string" }, razorpay_payment_id: { type: "string" }, razorpay_signature: { type: "string" } } } } } },
      responses: { "200": { description: "Payment verified successfully" } }
    }
  },
  "/api/contact": {
    get: {
      tags: ["Contact"],
      summary: "Get all contact inquiries",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of contact tickets" } }
    },
    post: {
      tags: ["Contact"],
      summary: "Submit a contact inquiry",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","subject","message"], properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, subject: { type: "string" }, message: { type: "string" }, inquiryType: { type: "string", enum: ["general","volunteer","donation","partnership","media","support"] } } } } } },
      responses: { "201": { description: "Ticket created with ticket number" } }
    }
  },
  "/api/feedback": {
    get: {
      tags: ["Feedback"],
      summary: "Get all feedback submissions",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of feedback" } }
    },
    post: {
      tags: ["Feedback"],
      summary: "Submit feedback",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","feedbackType","experienceRating","subject","message","wouldRecommend"], properties: { name: { type: "string" }, email: { type: "string" }, feedbackType: { type: "string", enum: ["service_experience","website","complaint","suggestion","appreciation"] }, experienceRating: { type: "integer", minimum: 1, maximum: 5 }, subject: { type: "string" }, message: { type: "string" }, wouldRecommend: { type: "string", enum: ["yes","maybe","no"] } } } } } },
      responses: { "201": { description: "Feedback submitted with reference number" } }
    }
  },
  "/api/board": {
    get: {
      tags: ["Board Applications"],
      summary: "Get all board applications",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of board applications" } }
    },
    post: {
      tags: ["Board Applications"],
      summary: "Submit board member application",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","dateOfBirth","address","city","state","currentPosition","organization","experience","qualifications","positionInterested","motivationStatement","timeCommitment"], properties: { name: { type: "string" }, email: { type: "string" }, currentPosition: { type: "string" }, positionInterested: { type: "string", enum: ["board_member","advisory_member","treasurer","secretary","any"] }, timeCommitment: { type: "string", enum: ["5_hours_month","10_hours_month","15_hours_month","20_plus_hours_month"] } } } } } },
      responses: { "201": { description: "Application submitted with application ID" } }
    }
  },
  "/api/legacy": {
    get: {
      tags: ["Legacy Giving"],
      summary: "Get all legacy giving requests",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of legacy requests" } }
    },
    post: {
      tags: ["Legacy Giving"],
      summary: "Submit legacy giving inquiry",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","legacyType"], properties: { name: { type: "string" }, email: { type: "string" }, legacyType: { type: "string", enum: ["will_bequest","life_insurance","retirement_plan","charitable_trust"] }, estimatedValue: { type: "string" }, timeframe: { type: "string" } } } } } },
      responses: { "201": { description: "Legacy request submitted" } }
    }
  },
  "/api/schemes": {
    get: {
      tags: ["Government Schemes"],
      summary: "Get all scheme applications",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of scheme applications" } }
    },
    post: {
      tags: ["Government Schemes"],
      summary: "Apply for a government scheme",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","schemeType","schemeName"], properties: { name: { type: "string" }, schemeType: { type: "string", enum: ["central","state"] }, schemeName: { type: "string" }, incomeCategory: { type: "string", enum: ["bpl","apl","middle_class"] } } } } } },
      responses: { "201": { description: "Application submitted" } }
    }
  },
  "/api/expansion": {
    get: {
      tags: ["Expansion Requests"],
      summary: "Get all expansion requests",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of expansion requests" } }
    },
    post: {
      tags: ["Expansion Requests"],
      summary: "Submit city expansion request",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","requestedCity","requestedState","localSupport","whyNeeded"], properties: { name: { type: "string" }, requestedCity: { type: "string" }, requestedState: { type: "string" }, localSupport: { type: "string", enum: ["individual","organization","government","community","multiple"] }, whyNeeded: { type: "string" } } } } } },
      responses: { "201": { description: "Expansion request submitted" } }
    }
  },
  "/api/tasks": {
    get: {
      tags: ["Tasks"],
      summary: "Get all volunteer tasks",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of tasks" } }
    },
    post: {
      tags: ["Tasks"],
      summary: "Create a new volunteer task",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","description","category","dueDate"], properties: { title: { type: "string" }, description: { type: "string" }, category: { type: "string", enum: ["cremation_assistance","transport_logistics","documentation","counseling","medical_support","emergency_response"] }, priority: { type: "string", enum: ["low","medium","high","urgent"] }, dueDate: { type: "string", format: "date" } } } } } },
      responses: { "201": { description: "Task created with task ID" } }
    }
  },
  "/api/content": {
    get: {
      tags: ["Content"],
      summary: "Get all content (blogs, pages, news)",
      parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["page","blog","news","service","faq","documentary","press"] } }, { name: "status", in: "query", schema: { type: "string", enum: ["draft","published","archived"] } }],
      responses: { "200": { description: "List of content" } }
    },
    post: {
      tags: ["Content"],
      summary: "Create new content",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title","content","type"], properties: { title: { type: "string" }, content: { type: "string" }, type: { type: "string", enum: ["page","blog","news","service","faq","documentary","press"] }, status: { type: "string", enum: ["draft","published"] }, metaTitle: { type: "string" }, metaDescription: { type: "string" } } } } } },
      responses: { "201": { description: "Content created" } }
    }
  },
  "/api/seo/page/{slug}": {
    get: {
      tags: ["SEO"],
      summary: "Get SEO config for a specific page",
      parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "homepage" } }],
      responses: { "200": { description: "SEO data for the page" } }
    }
  },
  "/api/seo/settings": {
    get: {
      tags: ["SEO"],
      summary: "Get global SEO settings",
      responses: { "200": { description: "Global SEO configuration" } }
    }
  },
  "/api/gallery": {
    get: {
      tags: ["Gallery"],
      summary: "Get all gallery items",
      responses: { "200": { description: "List of gallery images and videos" } }
    }
  },
  "/api/media": {
    get: {
      tags: ["Media"],
      summary: "Get all media assets",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of media assets" } }
    },
    post: {
      tags: ["Media"],
      summary: "Upload a new media asset",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" }, title: { type: "string" }, category: { type: "string" }, altText: { type: "string" } } } } } },
      responses: { "201": { description: "Media uploaded to Cloudinary" } }
    }
  },
  "/api/press": {
    get: {
      tags: ["Press"],
      summary: "Get all press releases",
      responses: { "200": { description: "List of press releases" } }
    }
  },
  "/api/documentaries": {
    get: {
      tags: ["Documentaries"],
      summary: "Get all documentaries",
      responses: { "200": { description: "List of documentaries" } }
    }
  },
  "/api/analytics": {
    get: {
      tags: ["Analytics"],
      summary: "Get analytics data",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "startDate", in: "query", schema: { type: "string", format: "date" } }, { name: "endDate", in: "query", schema: { type: "string", format: "date" } }],
      responses: { "200": { description: "Analytics data" } }
    }
  },
  "/api/admin/users": {
    get: {
      tags: ["Admin Users"],
      summary: "Get all admin users",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "List of admin users" } }
    },
    post: {
      tags: ["Admin Users"],
      summary: "Create new admin user",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name","email","phone","password","role"], properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, password: { type: "string" }, role: { type: "string", enum: ["technical_support","seo_team","media_team","manager","super_admin"] } } } } } },
      responses: { "201": { description: "Admin user created" } }
    }
  },
  "/api/admin/activities": {
    get: {
      tags: ["Activity Logs"],
      summary: "Get admin activity logs",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "userId", in: "query", schema: { type: "string" } }, { name: "action", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }],
      responses: { "200": { description: "Activity log entries" } }
    }
  },
  "/api/newsletter": {
    post: {
      tags: ["Newsletter"],
      summary: "Subscribe to newsletter",
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string" }, name: { type: "string" } } } } } },
      responses: { "201": { description: "Subscribed successfully" } }
    }
  },
  "/api/health": {
    get: {
      tags: ["System"],
      summary: "API health check",
      responses: { "200": { description: "API is running", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, timestamp: { type: "string" }, environment: { type: "string" } } } } } } }
    }
  }
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Moksha Sewa API',
      version: '1.0.0',
      description: 'Complete API documentation for Moksha Sewa multi-panel management system',
      contact: {
        name: 'Moksha Sewa Tech Team',
        email: 'info@mokshasewa.org'
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5003',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: manualPaths,
    tags: [
      { name: 'Authentication', description: 'Admin login, logout, token management' },
      { name: 'Reports', description: 'Unclaimed body report submissions' },
      { name: 'Volunteers', description: 'Volunteer registration and management' },
      { name: 'Donations', description: 'Donation tracking and management' },
      { name: 'Payments', description: 'Razorpay payment integration' },
      { name: 'Contact', description: 'Contact form inquiries' },
      { name: 'Feedback', description: 'User feedback submissions' },
      { name: 'Board Applications', description: 'Board member applications' },
      { name: 'Legacy Giving', description: 'Will and trust donation inquiries' },
      { name: 'Government Schemes', description: 'Government scheme applications' },
      { name: 'Expansion Requests', description: 'New city expansion requests' },
      { name: 'Tasks', description: 'Volunteer task management' },
      { name: 'Content', description: 'Blog, news, pages management' },
      { name: 'SEO', description: 'SEO configuration per page' },
      { name: 'Gallery', description: 'Photo and video gallery' },
      { name: 'Media', description: 'Media asset management' },
      { name: 'Press', description: 'Press release management' },
      { name: 'Documentaries', description: 'Documentary video management' },
      { name: 'Analytics', description: 'Traffic and performance analytics' },
      { name: 'Admin Users', description: 'Admin user management' },
      { name: 'Activity Logs', description: 'Admin audit trail' },
      { name: 'Newsletter', description: 'Newsletter subscriptions' },
      { name: 'System', description: 'Health check and system routes' }
    ]
  },
  apis: []
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
