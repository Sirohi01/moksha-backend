const CommunicationLog = require('./models/CommunicationLog');
const mongoose = require('mongoose');

async function checkLogs() {
  await mongoose.connect('mongodb://localhost:27017/mokshaSevaa');
  const logs = await CommunicationLog.find({ recipient: /9568259784/ }).sort({ createdAt: -1 }).limit(5);
  logs.forEach(log => {
      console.log('--- LOG ---');
      console.log('Content:', log.content);
      console.log('Metadata:', JSON.stringify(log.metadata, null, 2));
      console.log('Status:', log.status);
      console.log('ProviderMsgId:', log.providerMessageId);
      console.log('ErrorMsg:', log.errorMessage);
  });
  await mongoose.connection.close();
}

checkLogs();
