const os = require('os');

// Get all available network interfaces and their IPs
const getAvailableIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(interfaceName => {
    interfaces[interfaceName].forEach(interface => {
      // Skip internal/loopback addresses
      if (!interface.internal) {
        ips.push({
          interface: interfaceName,
          address: interface.address,
          family: interface.family, // IPv4 or IPv6
          type: interface.family === 'IPv4' ? 'IPv4' : 'IPv6'
        });
      }
    });
  });
  
  return ips;
};

// Get current client IP from request
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
};

// Format IP for display
const formatIPForDisplay = (ip) => {
  // Convert IPv4-mapped IPv6 addresses to IPv4
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
};

module.exports = {
  getAvailableIPs,
  getClientIP,
  formatIPForDisplay
};