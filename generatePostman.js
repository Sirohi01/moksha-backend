const fs = require('fs');
const path = require('path');

const postmanCollection = {
  "info": {
    "name": "Moksha Sewa API Collection",
    "description": "Complete API collection for Moksha Sewa management system",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"officialmanishsirohi.01@gmail.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Public Forms",
      "item": [
        {
          "name": "Submit Contact Form",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"+91 9876543210\",\n  \"subject\": \"General Inquiry\",\n  \"message\": \"Test message\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/contact",
              "host": ["{{baseUrl}}"],
              "path": ["contact"]
            }
          }
        },
        {
          "name": "Submit Volunteer Application",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jane Smith\",\n  \"email\": \"jane@example.com\",\n  \"phone\": \"+91 9876543210\",\n  \"skills\": \"Teaching, Community Work\",\n  \"availability\": \"Weekends\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/volunteers",
              "host": ["{{baseUrl}}"],
              "path": ["volunteers"]
            }
          }
        },
        {
          "name": "Submit Donation",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"donorName\": \"Donor Name\",\n  \"email\": \"donor@example.com\",\n  \"phone\": \"+91 9876543210\",\n  \"amount\": 5000,\n  \"donationType\": \"one-time\",\n  \"paymentMethod\": \"online\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/donations",
              "host": ["{{baseUrl}}"],
              "path": ["donations"]
            }
          }
        }
      ]
    }
  ]
};

// Generate Postman collection file
fs.writeFileSync(
  path.join(__dirname, 'Moksha_Seva_API.postman_collection.json'),
  JSON.stringify(postmanCollection, null, 2)
);

console.log('✅ Postman collection generated: Moksha_Seva_API.postman_collection.json');