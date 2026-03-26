const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  sendOTP,
  verifyOTP,
  sendMobileOTP,
  verifyMobileOTP,
  sendLoginOTP,
  loginWithOTP,
  verify2FALogin
} = require('../controllers/authController');
const { protect, authorize, authRateLimit } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { getAvailableIPs, getClientIP, formatIPForDisplay } = require('../utils/networkUtils');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^(\+91|91)?[6789]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['technical_support', 'seo_team', 'media_team', 'manager']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  validate
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// Public routes
router.post('/login', authRateLimit, loginValidation, login);
router.post('/forgot-password', authRateLimit, forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:resettoken', resetPasswordValidation, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', authRateLimit, sendOTP);
router.post('/verify-otp', authRateLimit, verifyOTP);
router.post('/send-mobile-otp', authRateLimit, sendMobileOTP);
router.post('/verify-mobile-otp', authRateLimit, verifyMobileOTP);
router.post('/send-login-otp', authRateLimit, sendLoginOTP);
router.post('/login-with-otp', authRateLimit, loginWithOTP);
router.post('/verify-2fa', authRateLimit, verify2FALogin);

// Protected routes
router.post('/register', protect, authorize('super_admin', 'manager'), registerValidation, register);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Network utilities
router.get('/available-ips', protect, authorize('super_admin', 'manager'), (req, res) => {
  try {
    const availableIPs = getAvailableIPs();
    const currentIP = formatIPForDisplay(getClientIP(req));
    
    res.json({
      success: true,
      data: {
        currentIP,
        availableIPs,
        suggestions: [
          currentIP,
          '127.0.0.1', // localhost
          '0.0.0.0',   // all interfaces
          ...availableIPs.map(ip => ip.address)
        ].filter((ip, index, arr) => arr.indexOf(ip) === index) // remove duplicates
      }
    });
  } catch (error) {
    console.error('Error getting available IPs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available IPs'
    });
  }
});

module.exports = router;