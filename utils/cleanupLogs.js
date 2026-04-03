const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ActivityLog = require('../models/ActivityLog');
const EmailLog = require('../models/EmailLog');
const SystemErrorLog = require('../models/SystemErrorLog');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete logs older than 30 days
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 30);

        const actRes = await ActivityLog.deleteMany({ createdAt: { $lt: dateLimit } });
        console.log(`✅ Deleted ${actRes.deletedCount} old activity logs`);

        const emailRes = await EmailLog.deleteMany({ createdAt: { $lt: dateLimit } });
        console.log(`✅ Deleted ${emailRes.deletedCount} old email logs`);

        const errRes = await SystemErrorLog.deleteMany({ createdAt: { $lt: dateLimit } });
        console.log(`✅ Deleted ${errRes.deletedCount} old system error logs`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

cleanup();
