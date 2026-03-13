const { getAvailableIPs } = require('./utils/networkUtils');

console.log('🌐 Available Network Interfaces and IPs:');
console.log('=====================================');

const availableIPs = getAvailableIPs();

if (availableIPs.length === 0) {
  console.log('No external network interfaces found.');
} else {
  availableIPs.forEach((ip, index) => {
    console.log(`${index + 1}. Interface: ${ip.interface}`);
    console.log(`   IP Address: ${ip.address}`);
    console.log(`   Type: ${ip.type}`);
    console.log('   ---');
  });
}

console.log('\n💡 Common IP options for admin registration:');
console.log('- 127.0.0.1 (localhost - for local access only)');
console.log('- 0.0.0.0 (all interfaces - allows access from any IP)');
availableIPs.forEach(ip => {
  console.log(`- ${ip.address} (${ip.interface} - ${ip.type})`);
});

console.log('\n📝 For admin registration, you can use any of these IPs in the allowedIPs field.');
console.log('💡 Tip: Use 0.0.0.0 if you want to allow access from any IP address.');