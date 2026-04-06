const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const { sendEmail } = require('../services/emailService');
const { sendWhatsAppOTP } = require('../services/whatsappService');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, allowedIPs, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      role: role || 'technical_support',
      allowedIPs: allowedIPs || [],
      permissions: permissions || []
    });

    // Generate token
    const token = admin.generateAuthToken();
    const refreshToken = admin.generateRefreshToken();
    await admin.save();

    // Send welcome email (don't fail registration if email fails)
    try {
      await sendEmail(admin.email, 'adminWelcome', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        tempPassword: password
      });
    } catch (emailError) {
      console.error('⚠️ Welcome email failed to send:', emailError.message);
      // Email failed but registration successful - continue
    }

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Admin registration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register admin'
    });
  }
};

// @desc    Login admin - Part 1: Verify Password & Send OTP
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin (include password for comparison)
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      await admin.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful credential check
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // SECOND FACTOR: WhatsApp OTP
    if (!admin.phone) {
      return res.status(400).json({
        success: false,
        message: 'No WhatsApp number linked to this account. Contact Super Admin.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Use official normalized email from DB instead of req.body to be 100% accurate
    const normalizedEmail = admin.email.toLowerCase().trim();

    // Save OTP to DB (associated with email for the second step)
    await OTP.deleteMany({ email: normalizedEmail }); // Clear old OTPs
    const savedOTP = await OTP.create({
      email: normalizedEmail,
      mobile: admin.phone,
      otp: otpCode
    });

    console.log(`✅ Phase 1: OTP [${otpCode}] saved for [${normalizedEmail}] (ID: ${savedOTP._id})`);

    // Send WhatsApp OTP
    const waResponse = await sendWhatsAppOTP(admin.phone, otpCode);

    if (!waResponse.success) {
      console.error('❌ WhatsApp OTP send failed:', waResponse.message);
      // Fallback or error
    }

    res.status(200).json({
      success: true,
      require2FA: true,
      message: 'Password verified. Please enter the OTP sent to your WhatsApp.',
      data: {
        email: admin.email,
        mobileMasked: admin.phone.replace(/.(?=.{4})/g, '*')
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
const verify2FALogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch admin FIRST to be sure of their official record
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      console.warn(`❌ 2FA Attempt for non-existent admin: ${normalizedEmail}`);
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }
    const otpRecord = await OTP.findOne({
      $or: [
        { email: normalizedEmail },
        { mobile: admin.phone }
      ]
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.warn(`⚠️ 2FA Failed: No OTP record found for ${normalizedEmail} or ${admin.phone} in DB.`);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or was never requested'
      });
    }

    if (otpRecord.otp !== otp.toString().trim()) {
      console.warn(`❌ 2FA Failed: Incorrect OTP [${otp}] for node [${normalizedEmail}].`);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }
    admin.lastLogin = new Date();
    const token = admin.generateAuthToken();
    const refreshToken = admin.generateRefreshToken();

    await admin.save();
    await OTP.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ 2FA verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Admin.findByIdAndUpdate(req.admin.id, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Admin logout failed:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          permissions: admin.permissions,
          avatar: admin.avatar,
          department: admin.department,
          joiningDate: admin.joiningDate,
          lastLogin: admin.lastLogin,
          allowedIPs: admin.allowedIPs,
          twoFactorEnabled: admin.twoFactorEnabled
        }
      }
    });

  } catch (error) {
    console.error('❌ Get admin profile failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile'
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, department } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, phone, avatar, department },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          avatar: admin.avatar,
          department: admin.department
        }
      }
    });

  } catch (error) {
    console.error('❌ Update profile failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    admin.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    admin.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await admin.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Send email
    await sendEmail(admin.email, 'passwordReset', {
      name: admin.name,
      resetUrl,
      resetToken
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('❌ Forgot password failed:', error);

    // Clear reset fields if email fails
    if (req.admin) {
      req.admin.resetPasswordToken = undefined;
      req.admin.resetPasswordExpire = undefined;
      await req.admin.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    // Generate new token
    const token = admin.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: { token }
    });

  } catch (error) {
    console.error('❌ Reset password failed:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Find admin and check if refresh token exists
    const admin = await Admin.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = admin.generateAuthToken();

    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken
      }
    });

  } catch (error) {
    console.error('❌ Refresh token failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check for existing OTP to prevent spamming (within 1 minute)
    const existingOTP = await OTP.findOne({ email, createdAt: { $gt: new Date(Date.now() - 60000) } });
    if (existingOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another OTP'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.create({
      email,
      otp: otpCode
    });

    // Send Email
    await sendEmail(email, 'otpVerification', {
      otp: otpCode
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('❌ Send OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.'
    });
  }
};

/**
 * @desc    Send OTP via WhatsApp to mobile number
 * @route   POST /api/auth/send-mobile-otp
 * @access  Public
 */
const sendMobileOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Check for existing OTP to prevent spamming (within 1 minute)
    const existingOTP = await OTP.findOne({ mobile, createdAt: { $gt: new Date(Date.now() - 60000) } });
    if (existingOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another OTP'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.create({
      mobile,
      otp: otpCode
    });

    // Send WhatsApp OTP
    const waResponse = await sendWhatsAppOTP(mobile, otpCode);

    if (waResponse.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your WhatsApp'
      });
    } else {
      // If WhatsApp fails, we still let the user know there was an issue
      res.status(500).json({
        success: false,
        message: waResponse.message || 'Failed to send WhatsApp OTP. Please try again or check your number.'
      });
    }

  } catch (error) {
    console.error('❌ Send Mobile OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp OTP. Please try again later.'
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find the latest OTP for this email
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or never requested'
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }

    // Success - Delete the OTP record so it can't be used again
    await OTP.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Verify OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

/**
 * @desc    Verify mobile OTP for WhatsApp
 * @route   POST /api/auth/verify-mobile-otp
 * @access  Public
 */
const verifyMobileOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Find the latest OTP for this mobile
    const otpRecord = await OTP.findOne({ mobile }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or never requested'
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }

    // Success - Delete the OTP record so it can't be used again
    await OTP.deleteMany({ mobile });

    res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully'
    });

  } catch (error) {
    console.error('❌ Verify Mobile OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

/**
 * @desc    Send OTP via WhatsApp for login
 * @route   POST /api/auth/send-login-otp
 * @access  Public
 */
const sendLoginOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Check if admin exists with this mobile number
    const admin = await Admin.findOne({ phone: mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin found with this mobile number'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check for existing OTP to prevent spamming (within 1 minute)
    const existingOTP = await OTP.findOne({ mobile, createdAt: { $gt: new Date(Date.now() - 60000) } });
    if (existingOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another OTP'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.create({
      mobile,
      otp: otpCode
    });

    // Send WhatsApp OTP
    const waResponse = await sendWhatsAppOTP(mobile, otpCode);

    if (waResponse.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your WhatsApp'
      });
    } else {
      res.status(500).json({
        success: false,
        message: waResponse.message || 'Failed to send WhatsApp OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('❌ Send login OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp OTP. Please try again later.'
    });
  }
};

/**
 * @desc    Login admin using WhatsApp OTP
 * @route   POST /api/auth/login-with-otp
 * @access  Public
 */
const loginWithOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ mobile }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or was never requested'
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code'
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ phone: mobile });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }

    // Success - Update admin info
    admin.lastLogin = new Date();
    await admin.resetLoginAttempts();

    // Generate tokens
    const token = admin.generateAuthToken();
    const refreshToken = admin.generateRefreshToken();

    await admin.save();

    // Delete OTP record
    await OTP.deleteMany({ mobile });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Login with OTP failed:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
};

module.exports = {
  register,
  login,
  verify2FALogin,
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
  loginWithOTP
};
