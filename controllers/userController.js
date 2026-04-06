const Admin = require('../models/Admin');

// @desc    Get all admin users
// @route   GET /api/admin/users
// @access  Private/Manager
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const users = await Admin.find(filter)
      .select('-password -refreshTokens -resetPasswordToken -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Admin.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get users failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get single admin user
// @route   GET /api/admin/users/:id
// @access  Private/Manager
const getUser = async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id)
      .select('-password -refreshTokens -resetPasswordToken -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Get user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// @desc    Update admin user
// @route   PUT /api/admin/users/:id
// @access  Private/Manager
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, allowedIPs, isActive, permissions } = req.body;
    
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (allowedIPs) user.allowedIPs = allowedIPs;
    if (isActive !== undefined) user.isActive = isActive;
    if (permissions) user.permissions = permissions;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('❌ Update user failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Manager
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('❌ Toggle user status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  toggleUserStatus
};