const crypto = require('crypto');

// Generates a 64-byte (512-bit) secret key as a hex string
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
