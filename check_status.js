const mongoose = require('mongoose');
require('dotenv').config();
const Report = require('./models/Report');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha_seva');
  const reports = await Report.find();
  console.log('Total Reports:', reports.length);
  reports.forEach(r => {
    console.log(`- ${r.caseNumber}: ${r.status} (resolvedAt: ${r.resolvedAt})`);
  });
  mongoose.connection.close();
}
check();
