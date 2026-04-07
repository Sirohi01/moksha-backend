const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX',
});
const createOrder = async (amount, receipt) => {
  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: receipt,
  };
  return instance.orders.create(options);
};

const verifySignature = (orderId, paymentId, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX');
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature,
  instance
};
