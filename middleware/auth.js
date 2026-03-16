const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const protect = async (req, res, next) => {
  try {
    let token;
    
    console.log(`🔍 Protect middleware - Headers:`, req.headers.authorization ? 'Present' : 'Missing');
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log(`🔍 Token extracted:`, token ? 'Present' : 'Missing');
    }
    
    if (!token) {
      console.log(`❌ No token provided in protect middleware`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      console.log(`🔍 Verifying JWT token...`);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`🔍 Token decoded for admin ID:`, decoded.id);
      
      const admin = await Admin.findById(decoded.id).select('-password');
      console.log(`🔍 Admin found:`, admin ? admin.email : 'Not found');

      if (!admin) {
        console.log(`❌ No admin found with ID: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          message: 'No admin found with this token'
        });
      }
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }
      if (admin.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }
      const clientIP = req.ip || req.connection.remoteAddress;
      console.log(`🔍 Auth middleware - IP: ${clientIP}, Allowed IPs:`, admin.allowedIPs);

      req.admin = admin;
      console.log(`✅ Admin authenticated: ${admin.email}, Role: ${admin.role}, Permissions:`, admin.permissions);
      next();
    } catch (error) {
      console.log(`❌ JWT verification failed:`, error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`🔍 Authorization check - Admin:`, req.admin ? req.admin.email : 'None');
    console.log(`🔍 Required roles:`, roles);
    console.log(`🔍 Admin role:`, req.admin ? req.admin.role : 'None');
    console.log(`🔍 Admin permissions:`, req.admin ? req.admin.permissions : 'None');
    
    if (!req.admin) {
      console.log(`❌ No admin found in request`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Super admin has access to everything
    if (req.admin.hasPermission('super_admin')) {
      console.log(`✅ Super admin access granted for ${req.admin.email}`);
      return next();
    }
    
    // Check if user has required role
    if (!roles.includes(req.admin.role)) {
      console.log(`❌ Role ${req.admin.role} not in allowed roles:`, roles);
      return res.status(403).json({
        success: false,
        message: `Role ${req.admin.role} is not authorized to access this route`
      });
    }

    console.log(`✅ Role-based access granted for ${req.admin.role}`);
    next();
  };
};

// Check specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Super admin has all permissions
    if (req.admin.hasPermission('super_admin')) {
      return next();
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (admin && admin.isActive && !admin.isLocked) {
          const clientIP = req.ip || req.connection.remoteAddress;
            req.admin = admin;
          // }
        }
      } catch (error) {
        // Token invalid, but continue without authentication
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This will be implemented with express-rate-limit
  // For now, just pass through
  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth,
  authRateLimit
};