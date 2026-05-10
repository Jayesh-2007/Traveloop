const crypto = require('crypto');

function generateShareToken() {
  return crypto.randomBytes(24).toString('base64url');
}

module.exports = generateShareToken;
